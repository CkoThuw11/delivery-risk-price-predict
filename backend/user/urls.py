from django.urls import path
from user.views import LogoutView,  RegisterView, LoginView


urlpatterns = [
   path("signup/", RegisterView.as_view(), name="register"),
   path('login/', LoginView.as_view(), name="login"),
   path('logout/', LogoutView.as_view(), name='logout'),
]

