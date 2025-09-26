from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User   

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
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        username = data.get("username")
        password = data.get("password")

        if not (username and email and password):
            raise serializers.ValidationError("Must provide username, email, and password")
        # tìm user khớp cả username & email
        user = User.objects.filter(username=username, email__iexact=email).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError("Wrong username, email or password")

        if not user.is_active:
            raise serializers.ValidationError("This account is disabled")

        data['user'] = user
        return data