from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User   
from django.db import models
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = "__all__" 

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            firstname=validated_data.get('firstname', ''),
            lastname=validated_data.get('lastname', ''),
            role='user'
        )
        return user


class LoginSerializer(serializers.Serializer):
    user_or_email = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user_or_email = data.get("user_or_email")
        password = data.get("password")

        if not user_or_email:
            raise serializers.ValidationError("Username or email is required")
        if not password:
            raise serializers.ValidationError("Password is required")
        
        user = None
        
        user = User.objects.filter(
            models.Q(username=user_or_email) | 
            models.Q(email__iexact=user_or_email)
        ).first()
        
        if not user or not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials")

        if not user.is_active:
            raise serializers.ValidationError("This account is disabled")

        data['user'] = user
        return data
    
# User role
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']


# Token JWT
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role  
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role
        }
        return data

