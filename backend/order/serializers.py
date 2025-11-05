from rest_framework import serializers
from order.models import OrderRecord,OrderMachineLearning #evaluationmetric

#============Để tạm, khi push là phải xóa=============#
class PredictionRecordSerializer(serializers.ModelSerializer):
  class Meta:
        model = OrderMachineLearning
        # nếu bạn muốn liệt kê rõ trường, thay '__all__' bằng danh sách fields
        fields = "__all__"
        read_only_fields = ("id",)
  

# class EvaluationMetricSerializer(serializers.ModelSerializer):
#      # Trả thông tin chi tiết của prediction (read-only, optional)
#     prediction_detail = PredictionRecordSerializer(source="prediction", read_only=True)

#     class Meta:
#         model = EvaluationMetric
#         fields = [
#             "id",
#             "prediction",         # OneToOneField — truyền ID khi tạo
#             "prediction_detail",  # nested data khi GET
#             "accuracy",
#             "precision",
#             "recall",
#             "f1_score",
#             "created_at",
#         ]
#         read_only_fields = ("id", "created_at", "prediction_detail")

    # # ---- Validate dữ liệu trước khi tạo ----
    # def validate(self, attrs):
    #     prediction = attrs.get("prediction")
    #     if prediction and hasattr(prediction, "evaluation"):
    #         raise serializers.ValidationError(
    #             "Prediction này đã có EvaluationMetric. (OneToOneField bị trùng)"
    #         )
    #     return attrs

    # # ---- Tạo mới metric ----
    # def create(self, validated_data):
    #     metric = EvaluationMetric.objects.create(**validated_data)
    #     return metric

    # # ---- Cập nhật metric ----
    # def update(self, instance, validated_data):
    #     for attr, value in validated_data.items():
    #         setattr(instance, attr, value)
    #     instance.save()
    #     return instance