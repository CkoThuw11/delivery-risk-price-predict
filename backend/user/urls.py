from django.urls import path
from .views import RegisterView,  LoginView

urlpatterns = [
   path("create/", RegisterView.as_view({'post': 'create'})),
   path('login/',  LoginView.as_view({'post': 'create'}))
]

