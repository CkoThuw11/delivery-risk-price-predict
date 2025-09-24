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
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username_or_email = data.get("email")
        password = data.get("password")

        if username_or_email and password:
            user = authenticate(username= username_or_email, password=password)
            if not user:
                raise serializers.ValidationError("Wrong information")
        else:
            raise serializers.ValidationError("Must have both user/email and password")

        data['user'] = user
        return data