from django.urls import path
from order.views import SalesByPayment, SalesByMarket, SalesByRegion, LateDeliveryByRegion,OrdersByShippingmode, DashboardOverviewAPIView


urlpatterns = [
   path('stats/orders/late-rate/', DashboardOverviewAPIView.as_view(), name="DashboardAPI"),
   path('stats/sales-by-payment/', SalesByPayment.as_view(), name="Sales by Payment"),
   path('stats/sales-by-market/', SalesByMarket.as_view(), name="Sales by Market"),
   path('stats/sales-by-region/', SalesByRegion.as_view(), name="Sales by Region"),
   path('stats/latedelivery-by-region/', LateDeliveryByRegion.as_view(), name="Sales by Region"),
   path('stats/orders-by-shippingmode/',OrdersByShippingmode.as_view(), name="Orders by Shipping Mode")
]



