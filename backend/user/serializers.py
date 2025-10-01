from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User   
from django.db import models
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'firstname', 'lastname']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            firstname=validated_data.get('firstname', ''),
            lastname=validated_data.get('lastname', ''),
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