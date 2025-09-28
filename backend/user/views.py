from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from user.serializers import LoginSerializer, RegisterSerializer
from rest_framework import status
from rest_framework.viewsets import ViewSet
from .models import User
from django.contrib.auth import logout
from rest_framework.permissions import IsAuthenticated
# Create your views here.



class LoginView(ViewSet):
    permission_classes = [AllowAny]  

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            # tạo token cho user
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "success": True,
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "firstname": getattr(user, "firstname", ""),
                    "lastname": getattr(user, "lastname", ""),
                    "date_joined": user.date_joined,
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]  # chỉ user đã login mới logout
    def post(self, request):
        # Xóa session hiện tại
        logout(request)
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)