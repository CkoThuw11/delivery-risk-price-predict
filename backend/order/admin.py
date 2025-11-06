from django.contrib import admin
from .models import OrderMachineLearning, OrderRecord,MLModel
# Register your models here
admin.site.register(OrderRecord)
admin.site.register(OrderMachineLearning)
admin.site.register(MLModel)