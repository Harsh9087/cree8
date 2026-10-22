from django.core.management.base import BaseCommand
from django.db import transaction
from library.models import Student, Seat, Allocation, Transaction, seed_seats

class Command(BaseCommand):
    help = "Clears all students, allocations, and transactions from the database and resets all seats to available."

    def handle(self, *args, **options):
        self.stdout.write("Clearing library data...")
        with transaction.atomic():
            t_count = Transaction.objects.all().delete()[0]
            a_count = Allocation.objects.all().delete()[0]
            s_count = Student.objects.all().delete()[0]
            Seat.objects.all().update(active=True)
            seed_seats()

        self.stdout.write(self.style.SUCCESS(
            f"Successfully cleared:\n"
            f" - {t_count} Transactions deleted\n"
            f" - {a_count} Allocations deleted\n"
            f" - {s_count} Students deleted\n"
            f" - All 64 Seats reset to available."
        ))
