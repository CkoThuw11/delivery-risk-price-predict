from django.urls import path
from user.views import LogoutView,  RegisterView, LoginAPIView


urlpatterns = [
   path("create/", RegisterView.as_view({'post': 'create'})),
   path('login/', LoginAPIView.as_view(), name="login"),
   path('logout/', LogoutView.as_view(), name='logout'),
]

