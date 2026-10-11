from django.db import models
from django.utils import timezone
from datetime import timedelta

class Student(models.Model):
    CHAIR_CHOICES = [("normal", "Normal"), ("executive", "Executive")]
    name = models.CharField(max_length=150)
    mobile = models.CharField(max_length=10, unique=True)
    alternate_mobile = models.CharField(max_length=10, blank=True)
    native_place = models.CharField(max_length=150, blank=True)
    currently_studying = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.mobile})"

class Seat(models.Model):
    number = models.PositiveSmallIntegerField(primary_key=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["number"]

    def __str__(self):
        return f"Seat {self.number}"

class Allocation(models.Model):
    CHAIR_CHOICES = [("normal", "Normal"), ("executive", "Executive")]
    PAYMENT_CHOICES = [("UPI", "UPI"), ("Cash", "Cash"), ("Bank Transfer", "Bank Transfer")]
    student = models.ForeignKey(Student, on_delete=models.PROTECT, related_name="allocations")
    seat = models.ForeignKey(Seat, on_delete=models.PROTECT, related_name="allocations")
    chair_type = models.CharField(max_length=12, choices=CHAIR_CHOICES)
    duration_months = models.PositiveSmallIntegerField(default=1)
    start_date = models.DateField(default=timezone.localdate)
    end_date = models.DateField()
    total_amount = models.PositiveIntegerField()
    amount_paid = models.PositiveIntegerField(default=0)
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="UPI")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def amount_pending(self):
        return max(self.total_amount - self.amount_paid, 0)

    def __str__(self):
        return f"Seat {self.seat_id} - {self.student.name}"

def seed_seats():
    for number in range(1, 52):
        Seat.objects.get_or_create(number=number)
