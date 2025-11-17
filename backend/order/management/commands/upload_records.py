import pandas as pd
import math
import os
from order.models import OrderRecord 
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction

# Mapping field
POSITIONAL_MAPPING = {
0: 'Type',
1: 'Days_for_shipping_real',
2: 'Days_for_shipment_scheduled',
3: 'Benefit_per_order',
4: 'Sales_per_customer',
5: 'Delivery_Status',
6: 'Late_delivery_risk',
7: 'Category_Id',
8: 'Category_Name',
9: 'Customer_City',
10: 'Customer_Country',
11: 'Customer_Email',
12: 'Customer_Fname',
13: 'Customer_Id',
14: 'Customer_Lname',
15: 'Customer_Password',
16: 'Customer_Segment',
17: 'Customer_State',
18: 'Customer_Street',
19: 'Customer_Zipcode',
20: 'Department_Id',
21: 'Department_Name',
22: 'Latitude',
23: 'Longitude',
24: 'Market',
25: 'Order_City',
26: 'Order_Country',
27: 'Order_Customer_Id',
28: 'Order_Date', 
29: 'Order_Id',
30: 'Order_Item_Cardprod_Id',
31: 'Order_Item_Discount',
32: 'Order_Item_Discount_Rate',
33: 'Order_Item_Id',
34: 'Order_Item_Product_Price',
35: 'Order_Item_Profit_Ratio',
36: 'Order_Item_Quantity',
37: 'Sales',
38: 'Order_Item_Total',
39: 'Order_Profit_Per_Order',
40: 'Order_Region',
41: 'Order_State',
42: 'Order_Status',
43: 'Order_Zipcode',
44: 'Product_Card_Id',
45: 'Product_Category_Id',
46: 'Product_Description',
47: 'Product_Image',
48: 'Product_Name',
49: 'Product_Price',
50: 'Product_Status',
51: 'Shipping_Date', 
52: 'Shipping_Mode',    
}
    
BATCH_SIZE = 5000  

class Command(BaseCommand):
    help = 'Bulk file into OrderRecord'

    def add_arguments(self, parser):
        parser.add_argument('csv_filepath', type=str)

    def handle(self, *args, **options):
        csv_filepath = options['csv_filepath']
        if not os.path.exists(csv_filepath):
            raise CommandError(f'File not found: {csv_filepath}')

        self.stdout.write(f"Reading CSV: {csv_filepath}")

        # Read CSV
        df = pd.read_csv(
            csv_filepath,
            header=None,
            encoding="latin-1",
            skiprows=1,
            dtype=str
        )

        # Date 
        df[28] = pd.to_datetime(df[28], errors='coerce')
        df[51] = pd.to_datetime(df[51], errors='coerce')

        # Clean 
        df[19] = df[19].astype(str).str.replace(r'\.0$', '', regex=True).replace('nan', None)
        df[43] = df[43].astype(str).str.replace(r'\.0$', '', regex=True).replace('nan', None)
        df[46] = df[46].astype(str).replace('nan', None)

        # Convert numeric
        int_cols = [1, 2, 6, 7, 13, 20, 27, 29, 30, 33, 36, 44, 45, 50]
        for col_index in int_cols:
            df[col_index] = pd.to_numeric(df[col_index], errors='coerce').astype('Int64')

        float_cols = [3, 4, 22, 23, 31, 32, 34, 35, 37, 38, 39, 49]
        for col_index in float_cols:
            df[col_index] = pd.to_numeric(df[col_index], errors='coerce')

        # Rename columns
        df.rename(columns=POSITIONAL_MAPPING, inplace=True)
        df = df[list(POSITIONAL_MAPPING.values())]

        # Convert NaN to None
        data_dicts = df.where(pd.notnull(df), None).to_dict('records')
        total_records = len(data_dicts)
        total_batches = math.ceil(total_records / BATCH_SIZE)

        self.stdout.write(f"Total records: {total_records}, inserting in {total_batches} batches of {BATCH_SIZE}...")

        try:
            for i in range(0, total_records, BATCH_SIZE):
                chunk = data_dicts[i:i+BATCH_SIZE]
                instances = [OrderRecord(**row) for row in chunk if row]
                with transaction.atomic():
                    OrderRecord.objects.bulk_create(instances, batch_size=BATCH_SIZE)
                self.stdout.write(f"Inserted batch {i//BATCH_SIZE + 1}/{total_batches}")

            self.stdout.write(self.style.SUCCESS(f"Successfully inserted {total_records} records."))
        except IntegrityError as e:
            raise CommandError(f"Database integrity error: {e}")
        except Exception as e:
            raise CommandError(f"Error: {e}")