import math
from django.utils import timezone
from rest_framework import serializers
from .models import Student, Seat, Allocation, Transaction

class TransactionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)
    student_mobile = serializers.CharField(source="student.mobile", read_only=True)
    seat_number = serializers.IntegerField(source="seat.number", read_only=True)
    amount_paid = serializers.IntegerField(source="amount", read_only=True)
    chair_type = serializers.CharField(source="allocation.chair_type", read_only=True, default="")
    duration_months = serializers.IntegerField(source="allocation.duration_months", read_only=True, default=0)
    start_date = serializers.DateField(source="allocation.start_date", read_only=True, default=None)
    end_date = serializers.DateField(source="allocation.end_date", read_only=True, default=None)

    class Meta:
        model = Transaction
        fields = [
            "id", "allocation", "student", "student_name", "student_mobile",
            "seat", "seat_number", "transaction_type", "description",
            "amount", "amount_paid", "chair_type", "duration_months",
            "start_date", "end_date", "payment_mode", "created_at"
        ]

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "name", "gender", "mobile", "alternate_mobile", "native_place",
                  "currently_studying", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_mobile(self, value):
        value = value.strip()
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Enter a valid 10-digit mobile number.")
        return value

    def validate_alternate_mobile(self, value):
        value = value.strip()
        if value and (not value.isdigit() or len(value) != 10):
            raise serializers.ValidationError("Alternate number must be 10 digits.")
        return value

class AllocationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)
    student_mobile = serializers.CharField(source="student.mobile", read_only=True)
    student_gender = serializers.CharField(source="student.gender", read_only=True)
    seat_number = serializers.IntegerField(source="seat.number", read_only=True)
    amount_pending = serializers.IntegerField(read_only=True)
    days_diff = serializers.SerializerMethodField()
    status_category = serializers.SerializerMethodField()
    is_seat_available = serializers.SerializerMethodField()

    class Meta:
        model = Allocation
        fields = [
            "id", "student", "student_name", "student_mobile", "student_gender", "seat",
            "seat_number", "chair_type", "duration_months", "start_date",
            "end_date", "total_amount", "amount_paid", "amount_pending",
            "payment_mode", "is_active", "is_upgraded", "upgrade_fee", "upgraded_at",
            "verification_status", "verification_notes", "verified_at", "auto_freed",
            "days_diff", "status_category", "is_seat_available", "created_at"
        ]
        read_only_fields = [
            "id", "end_date", "created_at", "is_active", "is_upgraded",
            "upgrade_fee", "upgraded_at", "auto_freed", "days_diff",
            "status_category", "is_seat_available"
        ]

    def get_days_diff(self, obj):
        today = timezone.localdate()
        return (obj.end_date - today).days

    def get_status_category(self, obj):
        diff = (obj.end_date - timezone.localdate()).days
        if diff < 0:
            return "ended"
        elif diff == 0:
            return "ending_today"
        elif 1 <= diff <= 3:
            return "expiring_urgent"
        elif 4 <= diff <= 7:
            return "expiring_soon"
        return "active"

    def get_is_seat_available(self, obj):
        return not Allocation.objects.filter(seat_id=obj.seat_id, is_active=True).exclude(pk=obj.pk).exists()

class SeatSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    allocation = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = ["number", "active", "status", "allocation"]

    def get_status(self, obj):
        allocation = obj.allocations.filter(is_active=True).select_related("student").first()
        return "occupied" if allocation else "available"

    def get_allocation(self, obj):
        allocation = obj.allocations.filter(is_active=True).select_related("student").first()
        if not allocation:
            return None

        today = timezone.localdate()
        effective_start = max(today, allocation.start_date)
        remaining_days = max(0, (allocation.end_date - effective_start).days)
        remaining_weeks = 0
        if remaining_days > 0:
            remaining_weeks = max(1, math.ceil(remaining_days / 7))
            if allocation.duration_months > 0:
                remaining_weeks = min(remaining_weeks, max(1, allocation.duration_months * 4))
        upgrade_cost = remaining_weeks * 50
        can_upgrade = allocation.chair_type == "normal" and remaining_days > 0 and allocation.is_active

        return {
            "id": allocation.id,
            "student_id": allocation.student_id,
            "student_name": allocation.student.name,
            "student_gender": allocation.student.gender,
            "student_mobile": allocation.student.mobile,
            "chair_type": allocation.chair_type,
            "duration_months": allocation.duration_months,
            "start_date": allocation.start_date.isoformat(),
            "end_date": allocation.end_date.isoformat(),
            "total_amount": allocation.total_amount,
            "amount_paid": allocation.amount_paid,
            "amount_pending": allocation.amount_pending,
            "payment_mode": allocation.payment_mode,
            "is_upgraded": allocation.is_upgraded,
            "upgrade_fee": allocation.upgrade_fee,
            "remaining_days": remaining_days,
            "remaining_weeks": remaining_weeks,
            "upgrade_cost": upgrade_cost,
            "can_upgrade": can_upgrade,
        }
