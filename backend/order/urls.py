from django.urls import path
from order.views import SalesByPayment, SalesByMarket, SalesByRegion, LateDeliveryByRegion,OrdersByShippingmode, DashboardOverviewAPIView, DeliveryPerformanceByDepartments

urlpatterns = [
   path('stats/orders/late-rate/', DashboardOverviewAPIView.as_view(), name="DashboardAPI"),
   path('stats/sales-by-payment/', SalesByPayment.as_view(), name="Sales by Payment"),
   path('stats/sales-by-market/', SalesByMarket.as_view(), name="Sales by Market"),
   path('stats/sales-by-region/', SalesByRegion.as_view(), name="Sales by Region"),
   path('stats/latedelivery-by-region/', LateDeliveryByRegion.as_view(), name="Sales by Region"),
   path('stats/deliveryperformance-by-top10-departments/', DeliveryPerformanceByDepartments.as_view(), name="Delivery Performance by Top 10 Departments")
   path('stats/orders-by-shippingmode/',OrdersByShippingmode.as_view(), name="Orders by Shipping Mode")
]



