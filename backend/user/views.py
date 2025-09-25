from django.shortcuts import render
from user.serializers import RegisterSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from .models import User

class RegisterView(ViewSet):
    '''
    Input: username, email, firstname, lastname, and password
    Ouput: message, user infor (except password), and status
    '''
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)

        user = serializer.save()

        return Response (
            {
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "firstname": user.firstname,
                    "lastname": user.lastname,
                },
            },
            status = status.HTTP_201_CREATED,
        )


