from django.contrib import admin
from .models import Student, Seat, Allocation, Transaction

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("name", "gender", "mobile", "currently_studying", "native_place")
    list_filter = ("gender",)
    search_fields = ("name", "mobile", "alternate_mobile")

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ("number", "active")

@admin.register(Allocation)
class AllocationAdmin(admin.ModelAdmin):
    list_display = ("seat", "student", "chair_type", "is_upgraded", "upgrade_fee", "start_date", "end_date",
                    "total_amount", "amount_paid", "is_active")
    list_filter = ("is_active", "chair_type", "is_upgraded", "payment_mode")
    search_fields = ("student__name", "student__mobile")

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "seat", "transaction_type", "amount", "payment_mode", "created_at")
    list_filter = ("transaction_type", "payment_mode", "created_at")
    search_fields = ("student__name", "student__mobile", "seat__number")
