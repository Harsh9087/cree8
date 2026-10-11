from calendar import monthrange
from datetime import date
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.http import JsonResponse
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Student, Seat, Allocation, seed_seats
from .serializers import StudentSerializer, SeatSerializer, AllocationSerializer

def add_months(start, months):
    month = start.month - 1 + months
    year = start.year + month // 12
    month = month % 12 + 1
    day = min(start.day, monthrange(year, month)[1])
    return date(year, month, day)

from datetime import timedelta

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

class AllocationList(generics.ListAPIView):
    queryset = Allocation.objects.select_related("student", "seat").all()
    serializer_class = AllocationSerializer
    permission_classes = [IsAuthenticated]

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    seed_seats()
    seats = Seat.objects.count()
    active_allocations = Allocation.objects.filter(is_active=True)
    occupied = active_allocations.count()
    occupied_executive = active_allocations.filter(chair_type="executive").count()
    occupied_normal = active_allocations.filter(chair_type="normal").count()
    pending = sum(a.amount_pending for a in active_allocations)
    paid = sum(a.amount_paid for a in active_allocations)
    return Response({
        "total_seats": seats,
        "occupied_seats": occupied,
        "available_seats": seats - occupied,
        "available_executive": max(0, 29 - occupied_executive),
        "available_normal": max(0, 22 - occupied_normal),
        "active_students": active_allocations.values("student_id").distinct().count(),
        "amount_collected": paid,
        "amount_pending": pending,
    })
