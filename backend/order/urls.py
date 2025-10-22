from django.urls import path
from order.views import SalesByPayment

urlpatterns = [
   path('stats/sales-by-payment/', SalesByPayment.as_view(), name="Sales by Payment")
]



