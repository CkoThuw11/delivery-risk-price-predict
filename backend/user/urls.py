from django.urls import path
from user.views import LoginAPIView

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
]