import pandas as pd
import math
import os
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from order.models import OrderForML



BATCH_SIZE = 2000


COLUMN_MAP = {
    "Department Name": "department_name",
    "Category Name": "category_name",
    "Customer State": "customer_state",
    "Order Status": "order_status",
    "Order Country": "order_country",
    "Order Region": "order_region",
    "Order State": "order_state",
    "Customer City": "customer_city",
    "Order City": "order_city",
    "Shipping Mode": "shipping_mode",
    "Type": "payment_type",

    # Numerical
    "Days for shipment (scheduled)": "days_for_shipment_scheduled",
    "Benefit per order": "benefit_per_order",
    "Sales per customer": "sales_per_customer",
    "Latitude": "latitude",
    "Longitude": "longitude",
    "Order Item Discount Rate": "order_item_discount_rate",
    "Order Item Product Price": "order_item_product_price",
    "Order Item Profit Ratio": "order_item_profit_ratio",
    "Order Item Quantity": "order_item_quantity",

    # Target
    "Late_delivery_risk": "late_delivery_risk",
}


class Command(BaseCommand):
    help = "Bulk file into OrderForML"

    def add_arguments(self, parser):
        parser.add_argument("csv_filepath", type=str)

    def handle(self, *args, **options):
        csv_filepath = options["csv_filepath"]

        if not os.path.exists(csv_filepath):
            raise CommandError(f"File not found: {csv_filepath}")

        self.stdout.write(f"Loading CSV: {csv_filepath}")

        # Load CSV
        df = pd.read_csv(csv_filepath, encoding="utf-8-sig")
        print(df.columns.tolist())

        # Select & rename columns
        missing_cols = [col for col in COLUMN_MAP.keys() if col not in df.columns]
        if missing_cols:
            raise CommandError(f"Missing required columns: {missing_cols}")

        df = df[list(COLUMN_MAP.keys())]
        df.rename(columns=COLUMN_MAP, inplace=True)

        df["late_delivery_risk"] = df["late_delivery_risk"].astype(int).astype(bool)

        df = df.where(pd.notnull(df), None)

        total = len(df)
        self.stdout.write(f"Total rows: {total}")

        records = df.to_dict("records")

        batches = math.ceil(total / BATCH_SIZE)

        for i in range(0, total, BATCH_SIZE):
            batch = records[i:i + BATCH_SIZE]
            objects = [OrderForML(**row) for row in batch]

            with transaction.atomic():
                OrderForML.objects.bulk_create(objects, batch_size=BATCH_SIZE)

            self.stdout.write(f"Inserted batch {i//BATCH_SIZE + 1}/{batches}")

        self.stdout.write(self.style.SUCCESS("upload completed successfully!"))
