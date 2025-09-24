from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

# Quản lý user (dùng để tạo user và superuser)
class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("Người dùng phải có email")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)  # Hash password
        user.save(using=self._db)
        return user
#Này theo t nghĩ là chia role thoi, mà có thể hiểu trong dự án mình như là nếu là nhân viên thì chỉ được nhập đoán dữ liệu, còn ad thì được xem chart tổng quan chi tiết đồ
    # def create_superuser(self, email, username, password=None, **extra_fields):
    #     extra_fields.setdefault("is_staff", True)
    #     extra_fields.setdefault("is_superuser", True)
    #     return self.create_user(email, username, password, **extra_fields)


# User model chính
class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    firstname = models.CharField(max_length=50, blank=True)
    lastname = models.CharField(max_length=50, blank=True)
    date_joined = models.DateTimeField(default=timezone.now)

    # # Các field hỗ trợ cho quản trị
    # is_active = models.BooleanField(default=True)
    # is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"         # Login bằng email
    REQUIRED_FIELDS = ["username"]   # Khi tạo superuser cần thêm username

    def __str__(self):
        return self.email