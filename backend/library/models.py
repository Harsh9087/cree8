from django.db import models
from django.utils import timezone
from datetime import timedelta

class Student(models.Model):
    CHAIR_CHOICES = [("normal", "Normal"), ("executive", "Executive")]
    GENDER_CHOICES = [("Male", "Male"), ("Female", "Female"), ("Other", "Other")]
    name = models.CharField(max_length=150)
    gender = models.CharField(max_length=10, blank=True, choices=GENDER_CHOICES, default="Male")
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
    is_upgraded = models.BooleanField(default=False)
    upgrade_fee = models.PositiveIntegerField(default=0)
    upgraded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def amount_pending(self):
        return max(self.total_amount - self.amount_paid, 0)

    def __str__(self):
        return f"Seat {self.seat_id} - {self.student.name}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ("allocation", "Seat Allocation"),
        ("upgrade", "Chair Upgrade"),
    ]
    PAYMENT_CHOICES = [("UPI", "UPI"), ("Cash", "Cash"), ("Bank Transfer", "Bank Transfer")]

    allocation = models.ForeignKey(Allocation, on_delete=models.CASCADE, related_name="transactions", null=True, blank=True)
    student = models.ForeignKey(Student, on_delete=models.PROTECT, related_name="transactions")
    seat = models.ForeignKey(Seat, on_delete=models.PROTECT, related_name="transactions")
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, default="allocation")
    description = models.CharField(max_length=200, blank=True)
    amount = models.PositiveIntegerField()
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="UPI")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.transaction_type} - {self.student.name} - ₹{self.amount}"

def seed_seats():
    for number in range(1, 65):
        Seat.objects.get_or_create(number=number)
