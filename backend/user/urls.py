from django.urls import path
from .views import RegisterView

urlpatterns = [
    path("create/", RegisterView.as_view({'post': 'create'})),
]
