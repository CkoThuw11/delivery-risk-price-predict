from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from user.serializers import LoginSerializer
# Create your views here.



class LoginAPIView(APIView):
    permission_classes = [AllowAny]  #này theo t hiểu là ai cũng login được, có thể mở rộng nếu sau này chia ra admin và staff

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