from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User   # import User model bạn đã tạo ở BE_01


# Serializer cho đăng ký
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


# Serializer cho đăng nhập
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Sai email hoặc mật khẩu")
        else:
            raise serializers.ValidationError("Phải nhập cả email và mật khẩu")

        data['user'] = user
        return data