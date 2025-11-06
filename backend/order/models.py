from django.db import models


class MLModel(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderMachineLearning(models.Model):
    # Category variables
    model = models.ForeignKey(MLModel, on_delete=models.CASCADE, related_name='orders',null=True,blank=True,default=None)
    department_name = models.CharField(max_length=100)
    category_name = models.CharField(max_length=100)
    customer_state = models.CharField(max_length=100)
    order_status = models.CharField(max_length=100)
    order_country = models.CharField(max_length=100)
    order_region = models.CharField(max_length=100)
    order_state = models.CharField(max_length=100)
    payment_type = models.CharField(max_length=100)
    customer_city = models.CharField(max_length=100)
    order_city = models.CharField(max_length=100)
    shipping_mode = models.CharField(max_length=100)

    # Numeric variables
    days_for_shipment_scheduled = models.FloatField()
    order_item_discount_rate = models.FloatField()
    order_item_product_price = models.FloatField()
    order_item_quantity = models.IntegerField()
    cost = models.FloatField()

    # Calculate variables
    sales_per_customer = models.FloatField(blank=True, null=True) #sales_per_customer=order_item_product_price * order_item_quantity*(1-order_item_discount_rate)
    benefit_per_order = models.FloatField(blank=True, null=True) #benefit_per_order=sales_per_customer - cost
    order_item_profit_ratio = models.FloatField(blank=True, null=True) #order_item_profit_ratio= benefit_per_order/sales_per_customer
    
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    late_delivery_risk = models.BooleanField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Calculate sales per person
        self.sales_per_customer = (
            self.order_item_product_price
            * self.order_item_quantity
            * (1 - self.order_item_discount_rate)
        )
        self.benefit_per_order = self.sales_per_customer - self.cost

        # Calculate order item profit ratio
        self.order_item_profit_ratio = (
            self.benefit_per_order / self.sales_per_customer
            if self.sales_per_customer != 0
            else 0
        )

        super().save(*args, **kwargs)


class OrderRecord(models.Model):
    # Transaction info
    Type = models.CharField(max_length=50, blank=True, null=True)
    Days_for_shipping_real = models.IntegerField(blank=True, null=True)
    Days_for_shipment_scheduled = models.IntegerField(blank=True, null=True)
    Benefit_per_order = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    Sales_per_customer = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    Delivery_Status = models.CharField(max_length=50, blank=True, null=True)
    Late_delivery_risk = models.IntegerField(blank=True, null=True)

    # Product category
    Category_Id = models.IntegerField(blank=True, null=True)
    Category_Name = models.CharField(max_length=255, blank=True, null=True)

    # Customer information
    Customer_City = models.CharField(max_length=255, blank=True, null=True)
    Customer_Country = models.CharField(max_length=255, blank=True, null=True)
    Customer_Email = models.EmailField(blank=True, null=True)
    Customer_Fname = models.CharField(max_length=255, blank=True, null=True)
    Customer_Id = models.CharField(max_length=100, blank=True, null=True)
    Customer_Lname = models.CharField(max_length=255, blank=True, null=True)
    Customer_Password = models.CharField(max_length=255, blank=True, null=True)
    Customer_Segment = models.CharField(max_length=100, blank=True, null=True)
    Customer_State = models.CharField(max_length=255, blank=True, null=True)
    Customer_Street = models.CharField(max_length=255, blank=True, null=True)
    Customer_Zipcode = models.CharField(max_length=50, blank=True, null=True)

    # Department
    Department_Id = models.IntegerField(blank=True, null=True)
    Department_Name = models.CharField(max_length=255, blank=True, null=True)

    # Geography
    Latitude = models.FloatField(blank=True, null=True)
    Longitude = models.FloatField(blank=True, null=True)

    # Market info
    Market = models.CharField(max_length=100, blank=True, null=True)

    # Order destination
    Order_City = models.CharField(max_length=255, blank=True, null=True)
    Order_Country = models.CharField(max_length=255, blank=True, null=True)
    Order_Customer_Id = models.CharField(max_length=100, blank=True, null=True)
    Order_Date = models.DateTimeField(blank=True, null=True)
    Order_Id = models.CharField(max_length=100, blank=True, null=True)

    # Order item info
    Order_Item_Cardprod_Id = models.CharField(max_length=100, blank=True, null=True)
    Order_Item_Discount = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    Order_Item_Discount_Rate = models.FloatField(blank=True, null=True)
    Order_Item_Id = models.CharField(max_length=100, blank=True, null=True)
    Order_Item_Product_Price = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    Order_Item_Profit_Ratio = models.FloatField(blank=True, null=True)
    Order_Item_Quantity = models.IntegerField(blank=True, null=True)
    Sales = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    Order_Item_Total = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    Order_Profit_Per_Order = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)

    # Order region info
    Order_Region = models.CharField(max_length=255, blank=True, null=True)
    Order_State = models.CharField(max_length=255, blank=True, null=True)
    Order_Status = models.CharField(max_length=100, blank=True, null=True)
    Order_Zipcode = models.CharField(max_length=50, blank=True, null=True)

    # Product info
    Product_Card_Id = models.CharField(max_length=100, blank=True, null=True)
    Product_Category_Id = models.IntegerField(blank=True, null=True)
    Product_Description = models.TextField(blank=True, null=True)
    Product_Image = models.URLField(blank=True, null=True)
    Product_Name = models.CharField(max_length=255, blank=True, null=True)
    Product_Price = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    Product_Status = models.IntegerField(blank=True, null=True)

    # Shipping info
    Shipping_Date = models.DateTimeField(blank=True, null=True)
    Shipping_Mode = models.CharField(max_length=100, blank=True, null=True)


# class EvaluationMetric(models.Model):
#     prediction= models.OneToOneField(OrderMachineLearning, on_delete=models.CASCADE, related_name='evaluation')
#     accuracy = models.FloatField()
#     precision = models.FloatField()
#     recall = models.FloatField()
#     f1_score = models.FloatField()
#     created_at = models.DateTimeField(auto_now_add=True)