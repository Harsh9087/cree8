from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="Seat",
            fields=[
                ("number", models.PositiveSmallIntegerField(primary_key=True, serialize=False)),
                ("active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["number"]},
        ),
        migrations.CreateModel(
            name="Student",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150)),
                ("mobile", models.CharField(max_length=10, unique=True)),
                ("alternate_mobile", models.CharField(blank=True, max_length=10)),
                ("education", models.CharField(blank=True, max_length=120)),
                ("preferred_chair", models.CharField(choices=[("normal", "Normal"), ("executive", "Executive")], default="normal", max_length=12)),
                ("joined_on", models.DateField(default=django.utils.timezone.localdate)),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Allocation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("chair_type", models.CharField(choices=[("normal", "Normal"), ("executive", "Executive")], max_length=12)),
                ("duration_months", models.PositiveSmallIntegerField(default=1)),
                ("start_date", models.DateField(default=django.utils.timezone.localdate)),
                ("end_date", models.DateField()),
                ("total_amount", models.PositiveIntegerField()),
                ("amount_paid", models.PositiveIntegerField(default=0)),
                ("payment_mode", models.CharField(choices=[("UPI", "UPI"), ("Cash", "Cash"), ("Bank Transfer", "Bank Transfer")], default="UPI", max_length=20)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("seat", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="allocations", to="library.seat")),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="allocations", to="library.student")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
