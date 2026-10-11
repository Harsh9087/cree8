from rest_framework import serializers
from .models import Student, Seat, Allocation

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "name", "mobile", "alternate_mobile", "native_place",
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
    seat_number = serializers.IntegerField(source="seat.number", read_only=True)
    amount_pending = serializers.IntegerField(read_only=True)

    class Meta:
        model = Allocation
        fields = ["id", "student", "student_name", "student_mobile", "seat",
                  "seat_number", "chair_type", "duration_months", "start_date",
                  "end_date", "total_amount", "amount_paid", "amount_pending",
                  "payment_mode", "is_active", "created_at"]
        read_only_fields = ["id", "end_date", "created_at", "is_active"]

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
        return {
            "id": allocation.id,
            "student_id": allocation.student_id,
            "student_name": allocation.student.name,
            "student_mobile": allocation.student.mobile,
            "chair_type": allocation.chair_type,
            "duration_months": allocation.duration_months,
            "start_date": allocation.start_date.isoformat(),
            "end_date": allocation.end_date.isoformat(),
            "total_amount": allocation.total_amount,
            "amount_paid": allocation.amount_paid,
            "amount_pending": allocation.amount_pending,
            "payment_mode": allocation.payment_mode,
        }
