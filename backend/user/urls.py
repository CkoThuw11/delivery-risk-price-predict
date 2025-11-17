from django.urls import path
from user.views import LogoutView,  RegisterView, LoginView, RegisterUserAPIView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
   path("signup/", RegisterView.as_view(), name="register"),
   path('login/', LoginView.as_view(), name="login"),
   path('logout/', LogoutView.as_view(), name='logout'),
   path('register-user/', RegisterUserAPIView.as_view(), name ='register'),
   path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

