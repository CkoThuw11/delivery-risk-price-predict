from django.contrib import admin
from .models import OrderMachineLearning, OrderRecord
# Register your models here
admin.site.register(OrderRecord)
admin.site.register(OrderMachineLearning)