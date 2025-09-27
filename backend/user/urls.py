from django.urls import path
from .views import RegisterView
from .views import LoginAPIView
from user.views import LogoutView


urlpatterns = [
   path("create/", RegisterView.as_view({'post': 'create'})),
   path('login/', LoginAPIView.as_view(), name="login"),
   path('logout/', LogoutView.as_view(), name='logout'),
]

