from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import logout
from .models import User
from user.serializers import LoginSerializer, RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterUserAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        role = request.data.get("role", "user")  # default to 'user'

        if role not in ["admin", "user", "trainer"]:
            return Response({"error": "Invalid role"}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password, role=role)
        return Response({"msg": f"User {username} created successfully"})

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        return Response({
            "success": True,
            "access": access,
            "refresh": str(refresh),
            "user": {
                "username": user.username,
                "email": user.email,
                "firstname": getattr(user, "firstname", ""),
                "lastname": getattr(user, "lastname", ""),
                "date_joined": user.date_joined,
                "role": user.role
            }
        }, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data = request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response (
                {
                    "message": "User registered successfully",
                    "user": {
                        "username": user.username,
                        "email": user.email,
                        "firstname": user.firstname,
                        "lastname": user.lastname,
                        "role": user.role
                    },
                },
                status = status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]  
    def post(self, request):
        logout(request)
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)