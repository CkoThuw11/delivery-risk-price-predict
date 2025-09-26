from django.urls import path
from .views import RegisterView
from .views import LoginAPIView

urlpatterns = [
   path("create/", RegisterView.as_view({'post': 'create'})),
   path('login/', LoginAPIView.as_view({'post': 'create'}))
]

