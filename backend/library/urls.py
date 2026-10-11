from django.urls import path
from . import views

urlpatterns = [
    path("csrf/", views.csrf),
    path("auth/login/", views.login_view),
    path("auth/logout/", views.logout_view),
    path("auth/me/", views.me_view),
    path("students/", views.StudentListCreate.as_view()),
    path("students/<int:pk>/", views.StudentDetail.as_view()),
    path("seats/", views.seats_view),
    path("seats/<int:seat_number>/allocate/", views.allocate_seat),
    path("seats/<int:seat_number>/release/", views.release_seat),
    path("allocations/", views.AllocationList.as_view()),
    path("dashboard/", views.dashboard_view),
]
