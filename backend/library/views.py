import math
from calendar import monthrange
from datetime import date, timedelta
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Student, Seat, Allocation, Transaction, seed_seats, auto_free_expired_allocations
from .serializers import StudentSerializer, SeatSerializer, AllocationSerializer, TransactionSerializer

def add_months(start, months):
    month = start.month - 1 + months
    year = start.year + month // 12
    month = month % 12 + 1
    day = min(start.day, monthrange(year, month)[1])
    return date(year, month, day)

@api_view(["GET"])
@permission_classes([AllowAny])
def csrf(request):
    from django.middleware.csrf import get_token
    return Response({"csrfToken": get_token(request)})

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username", "")
    password = request.data.get("password", "")
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({"detail": "Invalid username or password."}, status=400)
    login(request, user)
    return Response({"username": user.username, "is_staff": user.is_staff})

@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")
    email = request.data.get("email", "").strip()

    if not username:
        return Response({"detail": "Username is required."}, status=400)
    if not password:
        return Response({"detail": "Password is required."}, status=400)
    if len(password) < 4:
        return Response({"detail": "Password must be at least 4 characters long."}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return Response({"detail": "That username is already taken. Please choose another."}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.is_staff = True
    user.save()

    login(request, user)
    return Response({"username": user.username, "is_staff": user.is_staff}, status=201)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"detail": "Logged out."})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response({"username": request.user.username, "is_staff": request.user.is_staff})

class StudentListCreate(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search", "").strip()
        if search:
            from django.db.models import Q
            queryset = queryset.filter(Q(name__icontains=search) | Q(mobile__icontains=search))
        return queryset

class StudentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def seats_view(request):
    seed_seats()
    auto_free_expired_allocations()
    seats = Seat.objects.all().prefetch_related("allocations__student")
    return Response(SeatSerializer(seats, many=True).data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def allocate_seat(request, seat_number):
    seed_seats()
    try:
        seat = Seat.objects.select_for_update().get(number=seat_number, active=True)
    except Seat.DoesNotExist:
        return Response({"detail": "Seat not found."}, status=404)

    if Allocation.objects.filter(seat=seat, is_active=True).exists():
        return Response({"detail": "This seat is already occupied."}, status=409)

    student_id = request.data.get("student")
    chair_type = request.data.get("chair_type", "normal")
    duration = request.data.get("duration_months", 1)
    payment_mode = request.data.get("payment_mode", "UPI")
    amount_paid = request.data.get("amount_paid", None)
    try:
        student = Student.objects.get(pk=student_id)
    except (Student.DoesNotExist, ValueError, TypeError):
        return Response({"detail": "Select a valid registered student."}, status=400)
    if chair_type not in ("normal", "executive"):
        return Response({"detail": "Invalid chair type."}, status=400)
    if payment_mode not in ("UPI", "Cash", "Bank Transfer"):
        return Response({"detail": "Invalid payment mode."}, status=400)
    try:
        duration = int(duration)
        if duration < 0 or duration > 36:
            raise ValueError()
    except (ValueError, TypeError):
        return Response({"detail": "Duration must be between 0 (for 1-day trial) and 36 months."}, status=400)

    start_date_str = request.data.get("start_date")
    if start_date_str:
        from datetime import datetime
        try:
            start = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"detail": "Invalid start date format. Use YYYY-MM-DD."}, status=400)
    else:
        start = date.today()

    if duration == 0:
        total = 100
        end_date = start + timedelta(days=1)
    else:
        total = (1390 if chair_type == "normal" else 1590) * duration
        end_date = add_months(start, duration)
        
    if amount_paid is None:
        amount_paid = total
    try:
        amount_paid = int(amount_paid)
        if amount_paid < 0 or amount_paid > total:
            raise ValueError()
    except (ValueError, TypeError):
        return Response({"detail": f"Amount paid must be between ₹0 and the total amount (₹{total})."}, status=400)

    allocation = Allocation.objects.create(
        student=student, seat=seat, chair_type=chair_type,
        duration_months=duration, start_date=start,
        end_date=end_date, total_amount=total,
        amount_paid=amount_paid, payment_mode=payment_mode
    )
    if amount_paid > 0:
        Transaction.objects.create(
            allocation=allocation,
            student=student,
            seat=seat,
            transaction_type="allocation",
            description=f"Seat {seat.number} allocation ({chair_type} chair)",
            amount=amount_paid,
            payment_mode=payment_mode,
            created_at=allocation.created_at
        )
    return Response(AllocationSerializer(allocation).data, status=201)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def release_seat(request, seat_number):
    try:
        seat = Seat.objects.get(number=seat_number)
    except Seat.DoesNotExist:
        return Response({"detail": "Seat not found."}, status=404)
    allocation = Allocation.objects.filter(seat=seat, is_active=True).first()
    if not allocation:
        return Response({"detail": "Seat is already available."}, status=400)
    allocation.is_active = False
    allocation.save(update_fields=["is_active"])
    return Response({"detail": f"Seat {seat_number} is now available."})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def upgrade_seat(request, seat_number):
    try:
        seat = Seat.objects.get(number=seat_number)
    except Seat.DoesNotExist:
        return Response({"detail": "Seat not found."}, status=404)

    allocation = Allocation.objects.select_for_update().filter(seat=seat, is_active=True).first()
    if not allocation:
        return Response({"detail": "This seat is not currently occupied."}, status=400)

    if allocation.chair_type == "executive":
        return Response({"detail": "This seat is already an Executive chair."}, status=400)

    today = timezone.localdate()
    effective_start = max(today, allocation.start_date)
    remaining_days = max(0, (allocation.end_date - effective_start).days)
    if remaining_days <= 0:
        return Response({"detail": "Cannot upgrade an expired membership."}, status=400)

    # Automatic calculation: 1 to 7 days = 1 week, 8 to 14 days = 2 weeks, etc. (Round up partial weeks)
    calculated_weeks = max(1, math.ceil(remaining_days / 7))
    if allocation.duration_months > 0:
        calculated_weeks = min(calculated_weeks, max(1, allocation.duration_months * 4))

    upgrade_fee = calculated_weeks * 50

    payment_mode = request.data.get("payment_mode", "UPI")
    if payment_mode not in ("UPI", "Cash", "Bank Transfer"):
        return Response({"detail": "Invalid payment mode."}, status=400)

    # Automatic upgrade amount paid defaults to calculated upgrade_fee
    amount_paid_input = request.data.get("amount_paid")
    if amount_paid_input is None:
        amount_paid_for_upgrade = upgrade_fee
    else:
        try:
            amount_paid_for_upgrade = int(amount_paid_input)
            if amount_paid_for_upgrade < 0:
                raise ValueError()
        except (ValueError, TypeError):
            return Response({"detail": "Amount paid must be 0 or greater."}, status=400)

    allocation.chair_type = "executive"
    allocation.is_upgraded = True
    allocation.upgrade_fee += upgrade_fee
    allocation.total_amount += upgrade_fee
    allocation.amount_paid += amount_paid_for_upgrade
    allocation.upgraded_at = timezone.now()
    allocation.payment_mode = payment_mode
    allocation.save()

    # ONLY update the upgradation amount to transactions!
    if amount_paid_for_upgrade > 0:
        Transaction.objects.create(
            allocation=allocation,
            student=allocation.student,
            seat=allocation.seat,
            transaction_type="upgrade",
            description=f"Seat {seat.number} upgrade to Executive ({calculated_weeks} week(s))",
            amount=amount_paid_for_upgrade,
            payment_mode=payment_mode,
            created_at=allocation.upgraded_at
        )

    return Response({
        "detail": f"Seat {seat_number} upgraded to Executive Chair! Automatically added ₹{upgrade_fee} for {remaining_days} remaining day(s) ({calculated_weeks} week(s) @ ₹50/wk).",
        "upgrade_fee": upgrade_fee,
        "remaining_days": remaining_days,
        "weeks": calculated_weeks,
        "amount_paid_for_upgrade": amount_paid_for_upgrade,
        "allocation": AllocationSerializer(allocation).data
    })

class AllocationList(generics.ListAPIView):
    serializer_class = AllocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        auto_free_expired_allocations()
        return Allocation.objects.select_related("student", "seat").all().order_by("-created_at")

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def pay_pending_allocation(request, pk):
    try:
        allocation = Allocation.objects.select_for_update().select_related("student", "seat").get(pk=pk)
    except Allocation.DoesNotExist:
        return Response({"detail": "Allocation record not found."}, status=404)

    pending = allocation.amount_pending
    if pending <= 0:
        return Response({"detail": "No pending payment on this allocation."}, status=400)

    amount = request.data.get("amount")
    try:
        amount = int(amount)
        if amount <= 0 or amount > pending:
            raise ValueError()
    except (ValueError, TypeError):
        return Response({"detail": f"Amount must be between ₹1 and ₹{pending}."}, status=400)

    payment_mode = request.data.get("payment_mode", "UPI")
    if payment_mode not in ("UPI", "Cash", "Bank Transfer"):
        return Response({"detail": "Invalid payment mode."}, status=400)

    allocation.amount_paid += amount
    allocation.payment_mode = payment_mode
    allocation.save()

    Transaction.objects.create(
        allocation=allocation,
        student=allocation.student,
        seat=allocation.seat,
        transaction_type="allocation",
        description=f"Seat {allocation.seat_id} pending payment clearance ({allocation.student.name})",
        amount=amount,
        payment_mode=payment_mode,
        created_at=timezone.now()
    )

    return Response({
        "detail": f"Payment of ₹{amount} collected successfully for {allocation.student.name}.",
        "allocation": AllocationSerializer(allocation).data
    })

class TransactionList(generics.ListAPIView):
    queryset = Transaction.objects.select_related("student", "seat", "allocation").all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    seed_seats()
    auto_free_expired_allocations()
    seats = Seat.objects.count()
    active_allocations = Allocation.objects.filter(is_active=True)
    occupied = active_allocations.count()
    occupied_executive = active_allocations.filter(chair_type="executive").count()
    occupied_normal = active_allocations.filter(chair_type="normal").count()
    pending = sum(a.amount_pending for a in active_allocations)
    paid = sum(a.amount_paid for a in active_allocations)

    today = timezone.localdate()
    ended_count = Allocation.objects.filter(end_date__lt=today).count()
    pending_verification_count = Allocation.objects.filter(end_date__lt=today, verification_status="pending").count()
    expiring_soon_count = Allocation.objects.filter(is_active=True, end_date__gte=today, end_date__lte=today + timedelta(days=7)).count()

    return Response({
        "total_seats": seats,
        "occupied_seats": occupied,
        "available_seats": seats - occupied,
        "occupied_executive": occupied_executive,
        "occupied_normal": occupied_normal,
        "available_executive": seats - occupied,
        "available_normal": seats - occupied,
        "active_students": active_allocations.values("student_id").distinct().count(),
        "amount_collected": paid,
        "amount_pending": pending,
        "ended_subscriptions": ended_count,
        "pending_verification_count": pending_verification_count,
        "expiring_soon_subscriptions": expiring_soon_count,
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def subscriptions_view(request):
    seed_seats()
    freed_in_check = auto_free_expired_allocations()
    today = timezone.localdate()
    seven_days_ahead = today + timedelta(days=7)

    allocations = Allocation.objects.select_related("student", "seat").all().order_by("-end_date", "-created_at")

    ended_count = Allocation.objects.filter(end_date__lt=today).count()
    ending_today_count = Allocation.objects.filter(end_date=today).count()
    expiring_soon_count = Allocation.objects.filter(is_active=True, end_date__gt=today, end_date__lte=seven_days_ahead).count()
    pending_verification_count = Allocation.objects.filter(end_date__lt=today, verification_status="pending").count()
    confirmed_left_count = Allocation.objects.filter(verification_status="confirmed_left").count()
    renewed_count = Allocation.objects.filter(verification_status="renewed").count()
    retained_count = Allocation.objects.filter(verification_status="retained").count()

    return Response({
        "freed_in_this_check": freed_in_check,
        "stats": {
            "ended_count": ended_count,
            "ending_today_count": ending_today_count,
            "expiring_soon_count": expiring_soon_count,
            "pending_verification_count": pending_verification_count,
            "confirmed_left_count": confirmed_left_count,
            "renewed_count": renewed_count,
            "retained_count": retained_count,
        },
        "allocations": AllocationSerializer(allocations, many=True).data
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def verify_subscription(request, pk):
    try:
        alloc = Allocation.objects.select_for_update().select_related("student", "seat").get(pk=pk)
    except Allocation.DoesNotExist:
        return Response({"detail": "Subscription record not found."}, status=404)

    status_val = request.data.get("verification_status")
    notes = request.data.get("verification_notes")

    if status_val not in ("pending", "confirmed_left", "renewed", "retained"):
        return Response({"detail": "Invalid verification status value."}, status=400)

    alloc.verification_status = status_val
    if notes is not None:
        alloc.verification_notes = notes.strip()
    alloc.verified_at = timezone.now()

    if status_val == "confirmed_left":
        alloc.is_active = False

    alloc.save()
    return Response({
        "detail": f"Status updated to '{alloc.get_verification_status_display()}' for {alloc.student.name}.",
        "allocation": AllocationSerializer(alloc).data
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def renew_subscription(request, pk):
    try:
        old_alloc = Allocation.objects.select_for_update().select_related("student", "seat").get(pk=pk)
    except Allocation.DoesNotExist:
        return Response({"detail": "Previous allocation not found."}, status=404)

    seat_number = request.data.get("seat_number", old_alloc.seat_id)
    chair_type = request.data.get("chair_type", old_alloc.chair_type)
    duration = request.data.get("duration_months", old_alloc.duration_months)
    payment_mode = request.data.get("payment_mode", "UPI")
    amount_paid_input = request.data.get("amount_paid")
    notes = request.data.get("verification_notes", "")

    try:
        seat = Seat.objects.select_for_update().get(number=seat_number, active=True)
    except Seat.DoesNotExist:
        return Response({"detail": f"Seat {seat_number} not found."}, status=404)

    if Allocation.objects.filter(seat=seat, is_active=True).exclude(pk=old_alloc.pk).exists():
        return Response({"detail": f"Seat {seat_number} is currently occupied by another student. Please select an available seat."}, status=409)

    if chair_type not in ("normal", "executive"):
        return Response({"detail": "Invalid chair type."}, status=400)
    if payment_mode not in ("UPI", "Cash", "Bank Transfer"):
        return Response({"detail": "Invalid payment mode."}, status=400)

    try:
        duration = int(duration)
        if duration < 0 or duration > 36:
            raise ValueError()
    except (ValueError, TypeError):
        return Response({"detail": "Duration must be between 0 (trial) and 36 months."}, status=400)

    today = timezone.localdate()
    start_date_str = request.data.get("start_date")
    if start_date_str:
        from datetime import datetime
        try:
            start = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        except ValueError:
            start = max(today, old_alloc.end_date)
    else:
        start = max(today, old_alloc.end_date)

    if duration == 0:
        total = 100
        end_date = start + timedelta(days=1)
    else:
        total = (1390 if chair_type == "normal" else 1590) * duration
        end_date = add_months(start, duration)

    if amount_paid_input is None:
        amount_paid = total
    else:
        try:
            amount_paid = int(amount_paid_input)
            if amount_paid < 0 or amount_paid > total:
                raise ValueError()
        except (ValueError, TypeError):
            return Response({"detail": f"Amount paid must be between ₹0 and ₹{total}."}, status=400)

    old_alloc.is_active = False
    old_alloc.verification_status = "renewed"
    old_alloc.verified_at = timezone.now()
    if notes:
        old_alloc.verification_notes = notes.strip()
    old_alloc.save()

    new_alloc = Allocation.objects.create(
        student=old_alloc.student,
        seat=seat,
        chair_type=chair_type,
        duration_months=duration,
        start_date=start,
        end_date=end_date,
        total_amount=total,
        amount_paid=amount_paid,
        payment_mode=payment_mode,
        is_active=True,
        verification_status="pending"
    )

    if amount_paid > 0:
        Transaction.objects.create(
            allocation=new_alloc,
            student=new_alloc.student,
            seat=seat,
            transaction_type="allocation",
            description=f"Seat {seat.number} renewal ({duration} mo) - {new_alloc.student.name}",
            amount=amount_paid,
            payment_mode=payment_mode,
            created_at=new_alloc.created_at
        )

    return Response({
        "detail": f"Subscription renewed for {new_alloc.student.name} on Seat {seat.number} until {end_date}!",
        "new_allocation": AllocationSerializer(new_alloc).data
    }, status=201)
