from django.contrib import admin
from .models import Student, Seat, Allocation

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("name", "mobile", "currently_studying", "native_place")
    search_fields = ("name", "mobile", "alternate_mobile")

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ("number", "active")

@admin.register(Allocation)
class AllocationAdmin(admin.ModelAdmin):
    list_display = ("seat", "student", "chair_type", "start_date", "end_date",
                    "total_amount", "amount_paid", "is_active")
    list_filter = ("is_active", "chair_type", "payment_mode")
    search_fields = ("student__name", "student__mobile")
