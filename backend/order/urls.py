from django.urls import path
from order.views import SalesByPayment, SalesByMarket, SalesByRegion, LateDeliveryByRegion,OrdersByShippingmode, DashboardOverviewAPIView, DeliveryPerformanceByDepartments,DeliveryPerformancebyCategories, PredictionAPIView, TrainModelAPIView, SaveModelAPIView, LoadModelAPIView, ListModelsAPIView, PredictOneFromTrainedModelAPIView, OrderForMLListView, OrderForMLDetailView

urlpatterns = [
   # Admin Page - Overview + Detail Statistics + Predicting
   path('stats/orders/late-rate/', DashboardOverviewAPIView.as_view(), name="DashboardAPI"),
   path('stats/sales-by-payment/', SalesByPayment.as_view(), name="Sales by Payment"),
   path('stats/sales-by-market/', SalesByMarket.as_view(), name="Sales by Market"),
   path('stats/sales-by-region/', SalesByRegion.as_view(), name="Sales by Region"),
   path('stats/latedelivery-by-region/', LateDeliveryByRegion.as_view(), name="Sales by Region"),
   path('stats/deliveryperformance-by-categories/', DeliveryPerformancebyCategories.as_view(), name="Delivery Performance by Top 10 Categories"),
   path('stats/deliveryperformance-by-top10-departments/', DeliveryPerformanceByDepartments.as_view(), name="Delivery Performance by Top 10 Departments"),
   path('stats/orders-by-shippingmode/',OrdersByShippingmode.as_view(), name="Orders by Shipping Mode"),
   path('predicting/',PredictionAPIView.as_view(), name=""), # User have permission to call this API

   # Trainer Page - CRUD
   path('orders/', OrderForMLListView.as_view(), name='order-list-create'),
   path('orders/<int:pk>/', OrderForMLDetailView.as_view(), name='order-detail'),
   # Trainer Page - Training model and Predicting order

   path('train-model/', TrainModelAPIView.as_view(), name='train-model'),
   path('save-model/', SaveModelAPIView.as_view(), name='save-model'),
   path("list-models/", ListModelsAPIView.as_view()),
   path('load-model/', LoadModelAPIView.as_view(), name='load-model'),
   path('predicting-trained/', PredictOneFromTrainedModelAPIView.as_view(), name='predict')
]



