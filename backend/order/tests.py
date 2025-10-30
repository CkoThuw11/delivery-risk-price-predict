from django.test import TestCase
# from faker import Faker
from order.models import OrderMachineLearning, EvaluationMetric # Thêm EvaluationMetric
from order.serializers import PredictionRecordSerializer, EvaluationMetricSerializer
# Create your tests here.


class EvaluationMetricSerializerTest(TestCase):
    def setUp(self):
        # Tạo một Prediction instance hợp lệ (khóa ngoại)
        self.prediction_instance = OrderMachineLearning.objects.create(
            department_name="Sporting Goods", category_name="Fishing", 
            customer_state="Texas", order_status="PENDING", order_country="US",
            order_region="West", order_state="Texas", payment_type="Cash",
            customer_city="Dallas", order_city="Austin", shipping_mode="Express",
            days_for_shipment_scheduled=4.0, order_item_discount_rate=0.0,
            order_item_product_price=10.0, order_item_quantity=1, cost=5.0,
            latitude=33.0, longitude=-97.0, late_delivery_risk=False
        )
        
        # Dữ liệu giả hợp lệ cho EvaluationMetric
        self.valid_data = {
            "prediction": self.prediction_instance.id, # ID của OrderMachineLearning
            "accuracy": 0.95,
            "precision": 0.88,
            "recall": 0.92,
            "f1_score": 0.90,
        }

    def test_create_evaluation_metric_success(self):
        serializer = EvaluationMetricSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        metric_instance = serializer.save()
        
        # Kiểm tra instance đã được tạo
        self.assertEqual(metric_instance.accuracy, 0.95)
        self.assertEqual(metric_instance.prediction.id, self.prediction_instance.id)
        self.assertIsNotNone(metric_instance.created_at)

    def test_read_nested_prediction_detail(self):
        # Tạo metric để có thể đọc được
        metric_instance = EvaluationMetric.objects.create(**self.valid_data)

        # Đọc dữ liệu (không truyền data)
        serializer = EvaluationMetricSerializer(metric_instance)
        data = serializer.data
        
        # Kiểm tra nested data
        self.assertIn("prediction_detail", data)
        self.assertEqual(data["prediction_detail"]["id"], self.prediction_instance.id)
        self.assertEqual(data["prediction_detail"]["order_status"], "PENDING")


    def test_validate_duplicate_prediction_failure(self):
        # Tạo metric đầu tiên thành công
        EvaluationMetric.objects.create(**self.valid_data)
        
        # Thử tạo metric thứ hai với cùng prediction ID (Gây lỗi OneToOneField)
        serializer2 = EvaluationMetricSerializer(data=self.valid_data)
        
        self.assertFalse(serializer2.is_valid())
        self.assertIn('Prediction này đã có EvaluationMetric. (OneToOneField bị trùng)', str(serializer2.errors))