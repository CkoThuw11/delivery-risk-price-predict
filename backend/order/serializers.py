from rest_framework import serializers
from order.models import OrderRecord, OrderMachineLearning, MLModel, OrderForML

class PredictionRecordSerializer(serializers.ModelSerializer):
  class Meta:
        model = OrderMachineLearning
        fields = "__all__"
        read_only_fields = ("id",)

class OrderMachineLearningSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderMachineLearning
        fields = '__all__'
        read_only_fields = ('sales_per_customer', 'benefit_per_order', 'order_item_profit_ratio')

class MLModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModel
        fields = '__all__'

class OrderRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderRecord
        fields = '__all__'
  
class TrainModelRequestSerializer(serializers.Serializer):
    model_name = serializers.ChoiceField(choices=['ExtraTrees', 'RandomForest', 'DecisionTree'])
    resampling_method = serializers.ChoiceField(choices=['ROS', 'RUS', 'SMOTE', 'allKNN', 'SMOTETomek'])
    test_size = serializers.FloatField(default=0.2, min_value=0.1, max_value=0.5)
    random_state = random_state = serializers.IntegerField(required=False, default=42)

class OrderForMLSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderForML
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_days_for_shipment_scheduled(self, value):
        if value < 0:
            raise serializers.ValidationError("Days must be non-negative")
        return value
    
    def validate_order_item_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be positive")
        return value