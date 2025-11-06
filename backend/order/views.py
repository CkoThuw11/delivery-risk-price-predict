from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg, Min, Max,Q
from django.db.models.functions import TruncMonth
from order.models import OrderRecord,MLModel
from order.serializers import PredictionRecordSerializer
import os
import pickle
import gc
import joblib
# import shap
import pandas as pd
from scipy.sparse import hstack
from django.conf import settings
# Thư viện cho Machine Learning
import pandas as pd
import joblib
# import shap
import os # Để xử lý đường dẫn file
import requests # Dùng để gọi LLM API
from pydantic import BaseModel
import google.generativeai as genai

def normalize_input(input_dict):
    cleaned = {}
    for k, v in input_dict.items():
        if isinstance(v, str):
            cleaned[k] = v.strip().title()  # bỏ khoảng trắng + viết hoa đầu từ
        else:
            cleaned[k] = v
    return cleaned
def load_models(model_name='random_forest'):
    models_ros = {}
    project_root = settings.BASE_DIR
    model_files = {
                "DecisionTree":"decisiontree_resampling.pkl",
                "ExtraTrees":"extratrees_resampling.pkl",
                "RandomForest":"randomforest_resampling.pkl"
                        }
    for name, path in model_files.items():
        if not os.path.exists(path):
            print(f"❌ Không tìm thấy file: {path}")
            return None, "Tên mô hình không hợp lệ"
        
        try:
            with open(path, "rb") as f:
                pkg = pickle.load(f)
            # Kiểm tra cấu trúc và lấy encoder, scaler, model
            encoder = pkg.get("encoder")
            scaler = pkg.get("scaler")
            model = pkg.get("models", {}).get(name, {}).get("ROS")

            if encoder is None or scaler is None or model is None:
                return None, f"Thiếu encoder/scaler/model trong {name}, bỏ qua."

            models_ros[name] = {
                "encoder": encoder,
                "scaler": scaler,
                "model": model
            } #{"DecisionTree":{"encoder": encoder, "scaler": scaler, "model": model},...}

        except (EOFError, AttributeError, MemoryError, pickle.UnpicklingError) as e:
            return None, f"❌ Lỗi khi load {name}: {type(e).__name__} - {e}"
            
        except Exception as e:
            return None, f"⚠️ Lỗi không xác định khi load {name}: {e}"
        del pkg
        gc.collect()
    return models_ros, None
def predict_one_order_fast_only_active(model_package, input_dict,numerical_features,categorical_features):
    input_dict = normalize_input(input_dict)
    df = pd.DataFrame([input_dict])

    encoder = model_package["encoder"]
    model = model_package["model"]

    # === 1. Chuẩn bị dữ liệu ===
    X_num = df[numerical_features].values
    X_cate = encoder.transform(df[categorical_features])
    X_all = hstack((X_num, X_cate))

    # === 2. Dự đoán ===
    pred = model.predict(X_all)[0]
    prob = model.predict_proba(X_all)[0]
    label = "Trễ" if pred == 1 else "Không trễ"

    # === 3. Tính toán feature importance ===
    importances = model.feature_importances_

    # --- Numerical features ---
    features = list(numerical_features)
    values = [input_dict[f] for f in numerical_features]
    imps = importances[:len(numerical_features)].tolist()

    # --- Categorical features: chỉ giá trị đang active ---
    start_idx = len(numerical_features)
    for i, cat in enumerate(categorical_features):
        cat_columns = encoder.categories_[i]
        val = input_dict[cat]
        try:
            idx_in_cat = list(cat_columns).index(val)
        except ValueError:
            continue  # nếu value không có trong encoder

        # Vị trí trong toàn bộ vector one-hot
        feature_idx = start_idx + sum(len(c) for c in encoder.categories_[:i]) + idx_in_cat
        imp_value = importances[feature_idx]

        features.append(cat)
        values.append(val)
        imps.append(imp_value)

    # === 4. Gom kết quả gọn ===
    df_feat = (
        pd.DataFrame({"Feature": features, "Value": values, "Importance": imps})
        .sort_values("Importance", ascending=False)
        .reset_index(drop=True)
    )

    return pred, prob, df_feat
def get_LLM_recommendation(api_4_LLM):
    # Cấu hình Gemini
    GEMINI_API_KEY = "AIzaSyDmXyIeFfMvWnOn1h7OpVzpSm8xnG36wLQ"
    genai.configure(api_key=GEMINI_API_KEY)
    probability = api_4_LLM["prediction"].get("probability")
    label = api_4_LLM["prediction"].get("label")
    feature_importance = api_4_LLM["feature_importance"]

    # Prompt: yêu cầu chỉ trả về 1 đoạn văn recommendation
    prompt = f"""
    Bạn là chuyên gia logistics.
    Dưới đây là kết quả mô hình dự đoán khả năng giao hàng trễ:

    - Nhãn dự đoán: {label}
    - Xác suất trễ (chỉ để tham khảo): {probability}
    - Các yếu tố ảnh hưởng: {feature_importance}

    Hãy viết một đoạn ngắn bằng tiếng Việt (3-4 câu) nêu:
    - Xác xuất trễ này nằm ở mức cao hay thấp
    - Nguyên nhân chính gây trễ (dựa vào logic, không nêu số).
    - Cách khắc phục hợp lý để giảm rủi ro giao hàng trễ. (tầm một vài gạch đầu dòng và làm chi tiết)

    Chỉ trả về đoạn văn, **không thêm JSON hoặc ký hiệu đặc biệt nào**.
    """

    # Gọi Gemini model
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text.strip()

class DashboardOverviewAPIView(APIView):
    def get(self,request):
        try:
        #=========Start/end date=========#
            time_range=OrderRecord.objects.aggregate(
                started_date=Min("Order_Date"),
                ended_date=Max("Order_Date"))
        #=========KPI CARD=========#
            kpi_cards=OrderRecord.objects.aggregate(
                total_sales=Sum("Sales"),
                total_orders=Count("Order_Item_Id"),
                total_customers=Count("Customer_Id", distinct=True),
                total_profit=Sum("Benefit_per_order"),
            )
        #=========revenue_over_time(Linechart)=========#
            revenue_over_time = (
                OrderRecord.objects
                .annotate(month=TruncMonth("Order_Date")) #cắt phần ngày, giữ từ phần tháng
                .values("month") #nhóm data theo tháng
                .annotate(total_sales=Sum("Sales")) #tính tổng Sales theo tháng
                .order_by("month") #Sắp xếp lại theo thằng tháng
            )

            revenue_over_time_data = [
                {"month": r["month"].strftime("%Y-%m"), "sales": r["total_sales"]} for r in revenue_over_time
            ]
        #=========sales_by_customer_group(Piechart)=========#
            sales_by_customer_group=(
                OrderRecord.objects
                .values("Customer_Segment") #nhóm data theo nhóm Customer
                .annotate(total_sales=Sum("Sales")) #tính tổng Sales theo nhóm Customer
            )

            sales_by_customer_group_data=[
                {"segment":r["Customer_Segment"],"sales":r["total_sales"]} for r in sales_by_customer_group
            ]
        #=========Top_10_products(BarChart)=========#
            top_10_products=(
                OrderRecord.objects
                .values("Category_Name") #nhóm data theo nhóm Customer
                .annotate(total_sales=Sum("Sales")) #Tính thằng nào có doanh thu cao nhất
                .order_by("-total_sales")[:22]
            )

            top_10_products_data=[
                {"product": p["Category_Name"], "sales": p["total_sales"]}for p in top_10_products
            ]
        #=========Late_risk_over_time(Linechart)=========#
            late_risk_over_time=(
                OrderRecord.objects
                .annotate(month=TruncMonth("Order_Date")) #cắt phần ngày, giữ từ phần tháng
                .values("month") #nhóm data theo tháng
                .annotate(late_rate=Avg("Late_delivery_risk")) #tính tỉ lệ trễ theo tháng
                .order_by("month") #Sắp xếp lại theo thằng tháng
            )

            late_risk_over_time_data = [
                {"month": r["month"].strftime("%Y-%m"), "late_rate": r["late_rate"]} for r in late_risk_over_time
            ]
        #=========Top_10_sales_region(Bar_horizontal)=========#
            top_10_sales_region=(
                OrderRecord.objects
                .values("Order_Region") #nhóm data theo nhóm Customer
                .annotate(total_sales=Sum("Sales")) #Tính thằng nào có doanh thu cao nhất
                .order_by("-total_sales")[:10]
            )

            top_10_sales_region_data=[
                {"region": p["Order_Region"], "sales": p["total_sales"]}for p in top_10_sales_region
            ]
            

            response_data = {
                "dashboard_name": "Business Overview Dashboard",
                "time_range":{
                    "start":time_range["started_date"],
                    "end":time_range["ended_date"]
                },
                "kpi_cards": {
                    "total_sales": kpi_cards["total_sales"],
                    "total_orders": kpi_cards["total_orders"],
                    "total_customers": kpi_cards["total_customers"],
                    "total_profit": kpi_cards["total_profit"],
                },
                "revenue_over_time":{
                    "chart_type":"line",
                    "x_axis": "month",
                    "y_axis": "sales",
                    "unit": "USD",
                    "data":revenue_over_time_data
                },
                "sales_by_customer_group":{
                    "chart_type": "pie",
                    "label": "segment",
                    "value": "sales",
                    "unit": "USD",
                    "data": sales_by_customer_group_data
                },
                "top_10_category":{
                    "chart_type": "bar",
                    "label": "category",
                    "value": "sales",
                    "unit": "USD",
                    "data": top_10_products_data
                },
                "late_risk_over_time": {
                    "chart_type": "line_area",
                    "x_axis": "month",
                    "y_axis": "late_rate",
                    "unit": "",
                    "data": late_risk_over_time_data
                },
                "top_10_sales_region":{
                    "chart_type": "bar_horizontal",
                    "label": "region",
                    "value": "sales",
                    "unit": "USD",
                    "data": top_10_sales_region_data
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
               return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SalesByPayment(APIView):
    def get(self, request):
        try:
            queryset = (
                OrderRecord.objects
                .values("Type")
                .annotate(total_sales=Sum("Sales"))
                .order_by('-total_sales')
            )
            
            data_list = list(queryset)

            response_data = {
                "charts": { 
                    "chart_type": "bar",
                    "label": "Type",
                    "value": ["total_sales"],
                    "unit": "USD",
                    "data": data_list
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
               return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SalesByMarket(APIView):
    def get(self, request):
        try:
            queryset = (
                OrderRecord.objects
                .values("Market")
                .annotate(total_sales=Sum("Sales"))
                .order_by('-total_sales')
            )

            data_list = list(queryset)

            response_data = {
                "charts": {
                    "chart_type": "pie",
                    "label": "Market",
                    "value": "total_sales",
                    "unit": "USD",
                    "data": data_list
                }
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SalesByRegion(APIView):
    def get(self, request):
        try:
            queryset = (
                OrderRecord.objects
                .values("Market", "Order_Region")
                .annotate(total_sales=Sum("Sales"))
                .order_by("-total_sales")
            )
            data_by_market = {}
            for entry in queryset:
                market = entry["Market"]
                region = entry["Order_Region"]
                total_sales = entry["total_sales"]

                if market not in data_by_market:
                    data_by_market[market] = []
                
                data_by_market[market].append({
                    "region": region,
                    "total_sales": total_sales
                })

            response_data = {
                "charts": {
                    "chart_type": "bar",
                    "label": "region",
                    "value": ["total_sales"],
                    "unit": "USD",
                    "filter_field": "market",
                    "default_filter": "Africa",
                    "data": data_by_market
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class LateDeliveryByRegion(APIView):
    def get(self, request):
        try:
            queryset = (
                OrderRecord.objects
                .values("Market", "Order_Region")
                .annotate(
                    total_deliveries = Count("id"),
                    late_deliveries = Count("id", filter = Q(Late_delivery_risk = 1))
                )
                .order_by("Market", "Order_Region" )
            )
            data_by_market = {}
            for entry in queryset:
                market = entry["Market"]
                region = entry["Order_Region"]
                total = entry["total_deliveries"]
                late = entry["late_deliveries"]

                late_rate = late/total if total > 0 else 0

                if market not in data_by_market:
                    data_by_market[market] = []
                
                data_by_market[market].append({
                    "region": region,
                    "late_rate": round(late_rate, 2)
                })

            response_data = {
                "charts": {
                    "chart_type": "bar",
                    "label": "region",
                    "value": ["late_rate"],
                    "unit": "percentage",
                    "filter_field": "market",
                    "default_filter": "Africa",
                    "data": data_by_market
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class DeliveryPerformancebyCategories(APIView):
    def get(self, request):
        try:
            queryset = (
                OrderRecord.objects
                .values("Category_Name")
                .annotate(
                    total_on_time=Count("Late_delivery_risk",filter=Q(Late_delivery_risk=0)),
                    total_late=Count("Late_delivery_risk",filter=Q(Late_delivery_risk=1)),
                    total_sales=Sum("Sales")
                )
                .order_by("-total_sales")[:10]
            )
            data=[{
                    "category_name": r["Category_Name"],  "On_Time": r["total_on_time"], 
                    "Late": r["total_late"] } for r in queryset]
            response_data = {
                "charts": {
                    "chart_type": "bar",
                    "label": "category_name",
                    "value": ["On_Time", "Late"],
                    "unit": "order",
                    "stacked": True,
                    "data": data
                    }
                }   
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
          
class DeliveryPerformanceByDepartments(APIView):
     def get(self, request):
        try:
            queryset = (
                OrderRecord.objects
                .values("Department_Name")
                .annotate(
                    total_on_time=Count("Late_delivery_risk",filter=Q(Late_delivery_risk=0)),
                    total_late=Count("Late_delivery_risk",filter=Q(Late_delivery_risk=1))
                )
            )
            data=[{
                    "department_name": r["Department_Name"],  "On_Time": r["total_on_time"], 
                    "Late": r["total_late"] } for r in queryset]

            response_data = {
                "charts": {
                    "chart_type": "bar",
                    "label":"department_name",
                    "value":["On_Time", "Late"],
                    "unit": "order",
                    "stacked": True,
                    "data": data
                }   
            }
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                  
class OrdersByShippingmode(APIView):
    def get(self, request):
       try:
            queryset = (
                OrderRecord.objects
                .values("Shipping_Mode")
                .annotate(
                    total_orders = Count("Order_Id"),
                )
            )

            ordersbyshippingmode=[{"ShippingMode":r["Shipping_Mode"],"orders":r["total_orders"]} for r in queryset]

            response_data = {
                "charts": {
                    "chart_type": "pie",
                    "label": "ShippingMode",
                    "value": "orders",
                    "unit": "order",
                    "data": ordersbyshippingmode
                }
            }
            return Response(response_data, status=status.HTTP_200_OK)

       except Exception as e:
             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    


# ----------------- Hỗ trợ ML Functions ----------------- #
#Chuẩn bị các biến cho model pkl - Giả sử là t đã lấy dc 1 hàng từ mysql và giờ t tải nó lên và bốc từng key:value ra để chỉnh lại thành api bỏ vào thằng model pkl.
# def preprocess_for_model(prediction_instance):
#     feature_names = [
#                 'department_name', #Model,FE
#                 'category_name', #Model,FE
#                 'customer_state', #Model -> tính là bỏ, tự suy từ customer country -> do phần FE giải quyết
#                 'order_status', #Model,FE
#                 'order_country', #Model, FE
#                 'order_region', #FE,Model
#                 'payment_type', #FE,Model
#                 'customer_city', #FE,Model
#                 'order_city', #Model, FE
#                 'shipping_mode', #FE,Model
#                 'days_for_shipment_scheduled', #Model,FE
#                 'order_item_discount_rate', #Model, FE
#                 'order_item_product_price', #Model, FE
#                 'order_item_quantity', #Model, FE
#                 'benefit_per_order', #Model
#                 'sales_per_customer', #Model,FE
#                 'order_item_profit_ratio', #Model
#                 #Calculated variable
#                 "sales_per_customer", #sales_per_customer=order_item_product_price * order_item_quantity*(1-order_item_discount_rate)
#                 "benefit_per_order", #benefit_per_order=sales_per_customer - cost
#                 "order_item_profit_ratio", #order_item_profit_ratio= benefit_per_order/sales_per_customer 
#             ]
    
#     data_for_model = {}
#     for feature in feature_names:
#         # Lấy dữ liệu từ instance đã được lưu
#         value = getattr(prediction_instance, feature, None)
#         data_for_model[feature] = value
#     # Tạo DataFrame 1 hàng
#     input_df = pd.DataFrame({k: [v] for k, v in data_for_model.items()})
#     return input_df

# # Yêu cầu 2: Create function load_models
# def load_models():
#     """Tải tất cả các mô hình .pkl đã được lưu."""
#     models = {}
#     base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
#     # Giả định 3 mô hình đã được train và lưu
#     model_files = {
#         'decision_tree': 'decisiontree_resampling.pkl',
#         'extra_trees': 'extratrees_resampling.pkl',
#         'random_forest': 'randomforest_resampling.pkl',
#     }

#     for name, filename in model_files.items():
#         file_path = os.path.join(base_dir, filename)
#         if os.path.exists(file_path):
#             models[name] = joblib.load(file_path)
#         else:
#             # Tùy chọn: Log lỗi hoặc raise Exception nếu mô hình không tồn tại
#             print(f"Lỗi: Không tìm thấy file mô hình: {file_path}")
            
#     # Giả định Random Forest là mô hình chính (best model)
#     return models.get('random_forest', None)

# # Yêu cầu 3: Create function calculate_shap_values
# def calculate_shap_values(model, data_point):
#     """
#     Tính toán SHAP values cho một điểm dữ liệu.
#     data_point: là 1 DataFrame có 1 hàng dữ liệu đầu vào.
#     """
#     try:
#         # 1. Khởi tạo SHAP Explainer
#         # Dùng TreeExplainer cho các mô hình dựa trên cây (Random Forest)
#         explainer = shap.TreeExplainer(model)
        
#         # 2. Tính toán SHAP values
#         shap_values = explainer.shap_values(data_point)

#         # 3. Tổng hợp kết quả (Dùng độ lớn (magnitude) của SHAP value)
#         # Lấy SHAP values cho target class (giả định class 1 - Late Delivery Risk)
#         # Shap_values sẽ là một list 2 phần tử (cho class 0 và 1)
#         target_shap_values = shap_values[1] 
        
#         feature_importance = {}
#         for feature, shap_value in zip(data_point.columns, target_shap_values[0]):
#             feature_importance[feature] = abs(shap_value) # Độ lớn của SHAP value

#         # Sắp xếp và lấy Top Features nếu cần (Ở đây trả về tất cả)
        
#         return feature_importance

#     except Exception as e:
#         print(f"Lỗi khi tính SHAP values: {e}")
#         return {}

# class PredictionAPIView(APIView):
#     def post(self,request):
#         try:
#             # 1. Tải mô hình
#             model = load_models()
#             if model is None:
#                 return Response({"error": "Không thể tải mô hình dự đoán."}, 
#                                 status=status.HTTP_503_SERVICE_UNAVAILABLE)

#             # 2. Xử lý Input Data và lưu vào MySQL (data_raw là JSON từ FE)
#             data_raw = request.data.get("prediction_data", {})
            
#             # Khởi tạo Prediction Record
#             prediction_serializer = PredictionRecordSerializer(data=data_raw)
#             if not prediction_serializer.is_valid():
#                 return Response(prediction_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#             # LƯU INSTANCE VÀO DB: Việc này sẽ kích hoạt OrderMachineLearning.save() 
#             # để tính toán 3 biến dẫn xuất VÀ lưu tất cả vào MySQL.
#             prediction_instance = prediction_serializer.save()
#             #Kích hoạt hàm save() bên PredictionRecordSerializer để trở qua save() bên thằng model.py để tính 3 biến benefit_per_order, sales_per_customer, order_item_profit_ratio


#             # 3. Đọc dữ liệu đã lưu và Chuẩn bị (Mã hóa) cho Mô hình (Bước 2 của luồng mới)
#             # Dữ liệu hiện tại đã có 3 biến dẫn xuất nhờ model.save()
#             input_df = preprocess_for_model(prediction_instance)


#             # 4. Dự đoán và SHAP
#             prediction_label = model.predict(input_df)[0] 
#             prediction_proba = model.predict_proba(input_df)[:, 1][0] 
#             shap_values_dict = calculate_shap_values(model, input_df)

#             # 6. Lưu Prediction Record
#             # Gán kết quả dự đoán vào trường late_delivery_risk
#             prediction_data_to_save = prediction_serializer.validated_data
#             prediction_data_to_save['late_delivery_risk'] = bool(prediction_label)
#             prediction_instance = prediction_serializer.create(prediction_data_to_save)


#             # 7. Lưu Evaluation Metric (Giả định metric là 0.0 như trong request)
#             # Thường metric sẽ được tính toán sau trong quá trình triển khai, nhưng ở đây
#             # ta dùng dữ liệu cố định theo yêu cầu ticket
#             metric_data = {
#                 'prediction': prediction_instance.id,
#                 'accuracy': 0.0,
#                 'precision': 0.0,
#                 'recall': 0.0,
#                 'f1_score': 0.0,
#             }
#             metric_serializer = EvaluationMetricSerializer(data=metric_data)
#             metric_serializer.is_valid(raise_exception=True)
#             metric_instance = metric_serializer.save()


#             # 8. Xây dựng Response (Theo format yêu cầu trong ticket)
            
#             # Giả lập LLM suggestion và Feature importance chi tiết
#             # Lưu ý: SHAP values thường là số, cần xử lý để chuyển thành format yêu cầu:
#             llm_suggestion = "Based on the high Late Delivery Risk (84%), prioritize Express Shipping and alert the warehouse team for immediate dispatch."
            
#             # Chuyển SHAP values thành format yêu cầu
#             feature_importance_list = []
#             for feature, score in shap_values_dict.items():
#                 # Lấy giá trị gốc của feature từ data_raw để hiển thị
#                 original_value = prediction_data_to_save.get(feature) 
                
#                 # Giả định lấy 2 feature quan trọng nhất
#                 if len(feature_importance_list) < 2:
#                      feature_importance_list.append({
#                         "feature_name": feature,
#                         "value": original_value if original_value is not None else "N/A",
#                         "feature_importance_score": round(score, 4)
#                     })

#             response_data = {
#                 "prediction": {
#                     "label": str(prediction_label),
#                     "probability": round(prediction_proba, 4),
#                 },
#                 "metrics": metric_serializer.data, # Trả về metric đã lưu
#                 "feature_importance": feature_importance_list,
#                 "LLM_suggestion": llm_suggestion
#             }

        #     return Response(input_df, status=status.HTTP_200_OK) #response_data
        # except Exception as e:
        #     return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PredictionAPIView(APIView):
    def post(self,request):
        MODEL_USED_NAME = "ExtraTrees" #Chọn thẳng model là ExtraTrees
        try:
            serializer = PredictionRecordSerializer(data = request.data)
            if serializer.is_valid():
                prediction_instance = serializer.save()
                selected_categorical_features_trong = [
                                'Department Name', #Model,FE, tt
                                'Category Name', #Model,FE, tt
                                'Customer State', #Model, tt
                                'Order Status', #Model,FE, tt
                                'Order Country', #Model, FE, tt
                                'Order Region', #FE,Model, tt
                                'Order State', #FE,Model, tt
                                'Type', #FE,Model, tt
                                'Customer City', #FE,Model, tt
                                'Order City', #Model, FE, tt
                                'Shipping Mode' #FE,Model, tt
                                ]
                selected_numerical_features_trong = [
                                'Days for shipment (scheduled)', #Model,FE, tt
                            'Benefit per order', #tính bằng save() tại models.OrderMachineLearning
                            'Sales per customer', #tính bằng save() tại models.OrderMachineLearning
                            'Latitude', #không có trong FE nên k lấy mẫu
                            'Longitude', #không có trong FE nên k lấy mẫu
                            'Order Item Discount Rate', #
                            'Order Item Product Price', 
                            'Order Item Profit Ratio',
                            'Order Item Quantity',
                            # "cost"
                            ]
                input_dict={
                            "Department Name": prediction_instance.department_name,
                            "Category Name": prediction_instance.category_name,
                            "Customer State": prediction_instance.customer_state,
                            "Order Status": prediction_instance.order_status,
                            "Order Country": prediction_instance.order_country,
                            "Order Region": prediction_instance.order_region,
                            "Order State": prediction_instance.order_state,
                            "Type": prediction_instance.payment_type,
                            "Customer City": prediction_instance.customer_city,
                            "Order City": prediction_instance.order_city,
                            "Shipping Mode": prediction_instance.shipping_mode,
                            "Days for shipment (scheduled)": prediction_instance.days_for_shipment_scheduled, #
                            'Benefit per order': prediction_instance.benefit_per_order,
                            'Sales per customer': prediction_instance.sales_per_customer,
                            "Latitude": prediction_instance.latitude, #
                            "Longitude": prediction_instance.longitude, #
                            "Order Item Discount Rate": prediction_instance.order_item_discount_rate, #
                            "Order Item Product Price": prediction_instance.order_item_product_price,
                            'Order Item Profit Ratio': prediction_instance.order_item_profit_ratio,
                            "cost":prediction_instance.cost,
                            "Order Item Quantity": prediction_instance.order_item_quantity #
                        }

                model_package,error=load_models() #chỉ có 1 cách resampling ROS
                
                label, prob, metrics=predict_one_order_fast_only_active(
                                                        model_package[MODEL_USED_NAME],
                                                        input_dict,
                                                        numerical_features=selected_numerical_features_trong,
                                                        categorical_features=selected_categorical_features_trong
                                                        )

                
                llm_data={
                     "prediction":{
                     "label": label,
                     "probability": prob
                    #  "metrics":metrics
                    },
                    "feature_importance": metrics
                }
                
                LLM_response=get_LLM_recommendation(llm_data)
                print(LLM_response)
                # 4. CẬP NHẬT DB (model_id, late_delivery_risk)
                ml_model_instance = MLModel.objects.get(name__iexact=MODEL_USED_NAME)
                
                prediction_instance.late_delivery_risk = bool(label)
                prediction_instance.model_id = ml_model_instance
                # prediction_instance.llm_suggestion = LLM_suggestion # (Nếu có trường này trong model)
                
                prediction_instance.save()
                
                 # LƯU LẦN 2: Cập nhật kết quả dự đoán
                final_response={
                "prediction":{
                    "label":label,
                    "probability":prob
                },
                "LLM response":LLM_response
            }
                return Response(final_response, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)