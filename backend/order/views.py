# Import libraries
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Min, Max,Q
from django.db.models.functions import TruncMonth
from dateutil.relativedelta import relativedelta
from user.permissions import IsAdmin, IsUser, IsTrainer
from order.models import OrderRecord, MLModel, OrderForML
from order.serializers import PredictionRecordSerializer, TrainModelRequestSerializer, OrderForMLSerializer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from imblearn.over_sampling import RandomOverSampler, SMOTE
from imblearn.under_sampling import RandomUnderSampler, AllKNN
from imblearn.combine import SMOTETomek
from scipy.sparse import hstack
from dotenv import load_dotenv
import os
import pickle
import gc
import pandas as pd
import google.generativeai as genai
import pickle

load_dotenv()

# API for Visualization
class DashboardOverviewAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self,request):
        try:
            time_range=OrderRecord.objects.aggregate(
                started_date=Min("Order_Date"),
                ended_date=Max("Order_Date"))

        # KPI CARD
            kpi_cards=OrderRecord.objects.aggregate(
                total_sales=Sum("Sales"),
                total_orders=Count("Order_Item_Id"),
                total_customers=Count("Customer_Id", distinct=True),
                total_profit=Sum("Benefit_per_order"),
            )

            latest_date = time_range["ended_date"]
            if not latest_date:
                return Response({"message": "No data available"}, status=200)
            
            current_month_start = latest_date.replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )
            next_month_start = current_month_start + relativedelta(months=1)
            previous_month_start = current_month_start - relativedelta(months=1)

        # Revenue over time (Linechart)
            revenue_over_time = (
                OrderRecord.objects
                .annotate(month=TruncMonth("Order_Date"))
                .values("month") 
                .annotate(total_sales=Sum("Sales"))
                .order_by("month") 
            )

            revenue_over_time_data = [
                {"month": r["month"].strftime("%Y-%m"), "sales": r["total_sales"]} for r in revenue_over_time
            ]
        # Monthly Sales (Latest and Previous)
            current_month_kpi = OrderRecord.objects.filter(
                Order_Date__gte=current_month_start,
                Order_Date__lt=next_month_start
            ).aggregate(
                total_sales=Sum("Sales"),
                total_orders=Count("Order_Item_Id"),
                total_customers=Count("Customer_Id", distinct=True),
                total_profit=Sum("Benefit_per_order"),
            )

            previous_month_kpi = OrderRecord.objects.filter(
                Order_Date__gte=previous_month_start,
                Order_Date__lt=current_month_start
            ).aggregate(
                total_sales=Sum("Sales"),
                total_orders=Count("Order_Item_Id"),
                total_customers=Count("Customer_Id", distinct=True),
                total_profit=Sum("Benefit_per_order"),
            )   
        # Sales by customer group (Piechart)
            sales_by_customer_group=(
                OrderRecord.objects
                .values("Customer_Segment")
                .annotate(total_sales=Sum("Sales"))
            )

            sales_by_customer_group_data=[
                {"segment":r["Customer_Segment"],"sales":r["total_sales"]} for r in sales_by_customer_group
            ]
        # Top 10 products (BarChart)
            top_10_products=(
                OrderRecord.objects
                .values("Category_Name")
                .annotate(total_sales=Sum("Sales")) 
                .order_by("-total_sales")[:22]
            )

            top_10_products_data=[
                {"product": p["Category_Name"], "sales": p["total_sales"]}for p in top_10_products
            ]
        # Late_risk_over_time (Linechart)
            late_risk_over_time=(
                OrderRecord.objects
                .annotate(month=TruncMonth("Order_Date"))
                .values("month") 
                .annotate(late_rate=Avg("Late_delivery_risk")) 
                .order_by("month")
            )

            late_risk_over_time_data = [
                {"month": r["month"].strftime("%Y-%m"), "late_rate": r["late_rate"]} for r in late_risk_over_time
            ]
        # Top 10 sales region (Bar horizontal)
            top_10_sales_region=(
                OrderRecord.objects
                .values("Order_Region")
                .annotate(total_sales=Sum("Sales")) 
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
                "kpi_monthly": {
                    "current_month": {
                        "total_sales": current_month_kpi["total_sales"],
                        "total_orders": current_month_kpi["total_orders"],
                        "total_customers": current_month_kpi["total_customers"],
                        "total_profit": current_month_kpi["total_profit"],
                    },
                    "previous_month": {
                        "total_sales": previous_month_kpi["total_sales"],
                        "total_orders": previous_month_kpi["total_orders"],
                        "total_customers": previous_month_kpi["total_customers"],
                        "total_profit": previous_month_kpi["total_profit"],
                    }
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
    permission_classes = [IsAuthenticated, IsAdmin]
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
    permission_classes = [IsAuthenticated, IsAdmin]
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
    permission_classes = [IsAuthenticated, IsAdmin]
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
    permission_classes = [IsAuthenticated, IsAdmin]
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
    permission_classes = [IsAuthenticated, IsAdmin]
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
     permission_classes = [IsAuthenticated, IsAdmin]
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
    permission_classes = [IsAuthenticated, IsAdmin]
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


# API to Predict and Recommendation
# Global memory
LOADED_MODELS = {}

# Functions to response Recommendation to Admin
def normalize_input(input_dict):
    cleaned = {}
    for k, v in input_dict.items():
        if isinstance(v, str):
            cleaned[k] = v.strip().title()  
        else:
            cleaned[k] = v
    return cleaned

def load_models():
    models_ros = {}
    model_files = {
                "ExtraTrees":"extratrees_resampling.pkl",
                        }
    for name, path in model_files.items():
        if not os.path.exists(path):
            print(f"Not found: {path}")
            return None, "The model's name is not suitable"
        
        try:
            with open(path, "rb") as f:
                pkg = pickle.load(f)
                print("Open successfully")
            # Check structure
            encoder = pkg.get("encoder")
            scaler = pkg.get("scaler")
            model = pkg.get("models", {}).get(name, {}).get("ROS") # Choose ROS as default resampling method
            
            if encoder is None or scaler is None or model is None:
                return None, f"Missing encoder/scaler/model in {name}, Pass."

            models_ros[name] = {
                "encoder": encoder,
                "scaler": scaler,
                "model": model
            } 
        except (EOFError, AttributeError, MemoryError, pickle.UnpicklingError) as e:
            print(f"Error during loading {name}: {type(e).__name__} - {e}")
            return None, f"Error during loading {name}: {type(e).__name__} - {e}"
        except Exception as e:
            print(f"Unidentified error while loading {name}: {e}")
            return None, f"Unidentified error while loading {name}: {e}"
        del pkg
        gc.collect()
    return models_ros, None

def predict_one_order_fast_only_active(model_package, input_dict,numerical_features,categorical_features):
    input_dict = normalize_input(input_dict)
    df = pd.DataFrame([input_dict])

    encoder = model_package["encoder"]
    model = model_package["model"]

    X_num = df[numerical_features].values
    X_cate = encoder.transform(df[categorical_features])
    X_all = hstack((X_num, X_cate))

    pred = model.predict(X_all)[0]
    print(pred)
    prob = model.predict_proba(X_all)[0]
    print(prob)

    importances = model.feature_importances_

    features = list(numerical_features)
    values = [input_dict[f] for f in numerical_features]
    imps = importances[:len(numerical_features)].tolist()

    start_idx = len(numerical_features)
    for i, cat in enumerate(categorical_features):
        cat_columns = encoder.categories_[i]
        val = input_dict[cat]
        try:
            idx_in_cat = list(cat_columns).index(val)
        except ValueError:
            continue  

        feature_idx = start_idx + sum(len(c) for c in encoder.categories_[:i]) + idx_in_cat
        imp_value = importances[feature_idx]

        features.append(cat)
        values.append(val)
        imps.append(imp_value)

    df_feat = (
        pd.DataFrame({"Feature": features, "Value": values, "Importance": imps})
        .sort_values("Importance", ascending=False)
        .reset_index(drop=True)
    )

    return pred, prob, df_feat

def get_LLM_recommendation(api_4_LLM):
    # Config Gemini
    KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_API_KEY = KEY
    genai.configure(api_key=GEMINI_API_KEY)
    probability = api_4_LLM["prediction"].get("probability")
    label = api_4_LLM["prediction"].get("label")
    feature_importance = api_4_LLM["feature_importance"]

    # Get top 3 most important features
    top_features = feature_importance.head(3)
    features_str = "\n".join([
        f"- {row['Feature']}: {row['Value']}" 
        for _, row in top_features.iterrows()
    ])
    predict_result = ""
    if label == 1:
        predict_result = "Trễ"
    else:
        predict_result = "Đúng hạn"
        probability = 1 - probability
    # Determine risk level in Vietnamese
    prob_percent = probability * 100
    if prob_percent >= 70:
        risk_level = "Rất cao"
    elif prob_percent >= 50:
        risk_level = "Cao"
    elif prob_percent >= 30:
        risk_level = "Trung bình"
    else:
        risk_level = "Thấp"

    # Prompt
    prompt =  f"""
    Bạn là chuyên gia logistics. Dựa trên thông tin dưới đây, hãy phân tích NGẮN GỌN về rủi ro giao hàng trễ.

    THÔNG TIN:
    - Xác suất trễ: {prob_percent:.0f}%
    - Dự đoán mô hình: {predict_result}
    - Mức độ rủi ro: {risk_level}
    - Các yếu tố ảnh hưởng chính:
    {features_str}

    YÊU CẦU PHẢN HỒI (tối đa 100 từ):

    1. NẾU dự đoán = Trễ (label = 1):
    - Khẳng định mức rủi ro trễ tương ứng với xác suất.
    - Nêu 1–2 nguyên nhân chính từ các yếu tố quan trọng.
    - Đưa ra 3–4 khuyến nghị hành động để GIẢM rủi ro trễ.

    2. NẾU dự đoán = Đúng hạn (label = 0):
    - Khẳng định đơn hàng NHIỀU KHẢ NĂNG giao đúng hạn.
    - Nêu 1–2 yếu tố có thể GÂY TRỄ trong một số trường hợp.
    - Đưa ra 3–4 khuyến nghị dạng PHÒNG NGỪA, không phải xử lý trễ.

    QUY TẮC:
    - KHÔNG viết dài dòng.
    - KHÔNG lặp lại thông tin đầu vào.
    - KHÔNG dùng ký hiệu ** (chỉ dùng "-").
    - Văn phong rõ ràng, súc tích, dễ hiểu.
    """

    # Call Gemini model
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text.strip()

class PredictionAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsUser]
    def post(self,request):
        MODEL_USED_NAME = "ExtraTrees" # Choose this as a default model
        try:
            serializer = PredictionRecordSerializer(data = request.data)
            if serializer.is_valid():
                prediction_instance = serializer.save()
                selected_categorical_features = [
                                'Department Name', 
                                'Category Name', 
                                'Customer State', 
                                'Order Status', 
                                'Order Country',
                                'Order Region', 
                                'Order State', 
                                'Type', 
                                'Customer City', 
                                'Order City', 
                                'Shipping Mode' 
                                ]
                selected_numerical_features= [
                                'Days for shipment (scheduled)', 
                            'Benefit per order', 
                            'Sales per customer',
                            'Latitude', 
                            'Longitude',
                            'Order Item Discount Rate', 
                            'Order Item Product Price', 
                            'Order Item Profit Ratio',
                            'Order Item Quantity',
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
                            "Days for shipment (scheduled)": prediction_instance.days_for_shipment_scheduled, 
                            'Benefit per order': prediction_instance.benefit_per_order,
                            'Sales per customer': prediction_instance.sales_per_customer,
                            "Latitude": prediction_instance.latitude, 
                            "Longitude": prediction_instance.longitude, 
                            "Order Item Discount Rate": prediction_instance.order_item_discount_rate, 
                            "Order Item Product Price": prediction_instance.order_item_product_price,
                            'Order Item Profit Ratio': prediction_instance.order_item_profit_ratio,
                            "cost":prediction_instance.cost,
                            "Order Item Quantity": prediction_instance.order_item_quantity 
                        }

                model_package,error=load_models() 
                try:
                    label, prob, metrics=predict_one_order_fast_only_active(
                                                        model_package[MODEL_USED_NAME],
                                                        input_dict,
                                                        numerical_features=selected_numerical_features,
                                                        categorical_features=selected_categorical_features
                                                        )
                except Exception as e:
                    print(e)
                b_prob=prob[1] if prob[1]>prob[0] else prob[0]
                llm_data={
                     "prediction":{
                     "label": label,
                     "probability": b_prob 
                    },
                    "feature_importance": metrics
                }
                LLM_response=get_LLM_recommendation(llm_data)
                ml_model_instance = MLModel.objects.get(name__iexact=MODEL_USED_NAME)
                
                prediction_instance.late_delivery_risk = bool(label)
                prediction_instance.model_id = ml_model_instance
                
                prediction_instance.save()
                
                final_response={
                "prediction":{
                    "label":label,
                    "probability":b_prob
                },
                "llm_response":LLM_response
            }
                return Response(final_response, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# API to Training - Evaluation - Save - Load Model and CRUD
class TrainModelAPIView(APIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    
    def post(self, request):
        try:
            serializer = TrainModelRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            model_name = serializer.validated_data['model_name']
            resampling_method = serializer.validated_data['resampling_method']
            test_size = serializer.validated_data['test_size']
            random_state = serializer.validated_data.get('random_state', 42)
            # Fetch data 
            queryset = OrderForML.objects.all().values()
            data = list(queryset)
            
            if not data:
                return Response(
                    {"error": "No data available in database"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            df = pd.DataFrame(list(queryset))
            
            # Data cleaning
            df = df.dropna(subset=['late_delivery_risk'])
            df['late_delivery_risk'] = df['late_delivery_risk'].astype(int)
            
            print(f"=== DEBUG ===")
            print(f"Total rows: {len(df)}")
            print(f"Late delivery risk unique values: {df['late_delivery_risk'].unique()}")
            
            # Feature selection
            selected_categorical_features = [
                'department_name', 'category_name', 'customer_state',
                'order_status', 'order_country', 'order_region',
                'order_state', 'payment_type', 'customer_city', 'order_city',
                'shipping_mode'
            ]

            selected_numerical_features = [
                'days_for_shipment_scheduled', 'benefit_per_order', 'sales_per_customer',
                'latitude', 'longitude', 'order_item_discount_rate',
                'order_item_product_price', 'order_item_profit_ratio',
                'order_item_quantity'
            ]

            missing = [
                col for col in selected_categorical_features + selected_numerical_features 
                if col not in df.columns
            ]
            if missing:
                return Response(
                    {"error": f"Missing columns: {missing}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            for col in selected_numerical_features:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            df = df.dropna(subset=selected_numerical_features)
            
            X = df[selected_categorical_features + selected_numerical_features]
            y = df['late_delivery_risk']
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=random_state
            )
            
            encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=True)
            encoder.fit(X_train[selected_categorical_features])
            
            X_train_cate = encoder.transform(X_train[selected_categorical_features])
            X_test_cate = encoder.transform(X_test[selected_categorical_features])
            
            X_train_num = X_train[selected_numerical_features].astype(float).values
            X_test_num = X_test[selected_numerical_features].astype(float).values
            
            X_train_all = hstack([X_train_num, X_train_cate])
            X_test_all = hstack([X_test_num, X_test_cate])

            scaler = StandardScaler(with_mean=False)
            X_train_final = scaler.fit_transform(X_train_all)
            X_test_final = scaler.transform(X_test_all)

            resamplers = {
                'ROS': RandomOverSampler(random_state=random_state),
                'RUS': RandomUnderSampler(random_state=random_state),
                'SMOTE': SMOTE(random_state=random_state),
                'allKNN': AllKNN(),
                'SMOTETomek': SMOTETomek(random_state=random_state)
            }
            
            resampler = resamplers[resampling_method]
            X_res, y_res = resampler.fit_resample(X_train_final, y_train)
            
            models = {
                'ExtraTrees': ExtraTreesClassifier(random_state=random_state),
                'RandomForest': RandomForestClassifier(random_state=random_state),
                'DecisionTree': DecisionTreeClassifier(random_state=random_state)
            }
            
            model = models[model_name]
            model.fit(X_res, y_res)
            
            # Evaluate model
            y_pred = model.predict(X_test_final)
            
            metrics = {
                'accuracy': float(accuracy_score(y_test, y_pred)),
                'precision': float(precision_score(y_test, y_pred, zero_division=0)),
                'recall': float(recall_score(y_test, y_pred, zero_division=0)),
                'f1_score': float(f1_score(y_test, y_pred, zero_division=0))
            }
            
            # Store model in global memory
            LOADED_MODELS['latest'] = {
                'model_name': model_name,
                'resampling_method': resampling_method,
                'random_state': random_state,
                'test_size': test_size,
                'metrics': metrics,
                'model_object': model,
                'encoder': encoder,
                'scaler': scaler,
                'categorical_features': selected_categorical_features,
                'numerical_features': selected_numerical_features,
                'y_test': y_test,
                'y_pred': y_pred
            }

            return Response({
                "message": "Model trained successfully",
                "model_name": model_name,
                "resampling_method": resampling_method,
                "random_state": random_state,
                "metrics": metrics
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SaveModelAPIView(APIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    
    def post(self, request):
        try:
            if 'latest' not in LOADED_MODELS:
                return Response(
                    {"error": "No trained model found. Please train a model first."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            trained = LOADED_MODELS['latest']

            # filename with model_name, random_state, and resampling_method
            file_name = f"{trained['model_name']}_{trained['random_state']}_{trained['resampling_method']}.pkl"

            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            models_dir = os.path.join(base_dir, "models")
            os.makedirs(models_dir, exist_ok=True)

            file_path = os.path.join(models_dir, file_name)

            model_data = {
                'model_name': trained['model_name'],
                'resampling_method': trained['resampling_method'],
                'random_state': trained['random_state'],
                'test_size': trained['test_size'],
                'metrics': trained['metrics'],
                'model_object': trained['model_object'],
                'encoder': trained['encoder'],
                'scaler': trained['scaler'],
                'categorical_features': trained['categorical_features'],
                'numerical_features': trained['numerical_features']
            }

            # Save model 
            with open(file_path, "wb") as f:
                pickle.dump(model_data, f)

            response_data = {
                "message": f"Model saved successfully as '{file_name}'",
                "file_name": file_name,
                "model_details": {
                    "model_name": trained['model_name'],
                    "random_state": trained['random_state'],
                    "resampling_method": trained['resampling_method'],
                    "metrics": {
                        "accuracy": float(trained['metrics']['accuracy']),
                        "precision": float(trained['metrics']['precision']),
                        "recall": float(trained['metrics']['recall']),
                        "f1_score": float(trained['metrics']['f1_score'])
                    }
                }
            }

            if 'latest' in LOADED_MODELS:
                del LOADED_MODELS['latest']

            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in SaveModelAPIView: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class LoadModelAPIView(APIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    def post(self, request):
        try:
            file_name = request.data.get("filename")
            if not file_name:
                return Response({"error": "filename is required"}, status=400)

            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(base_dir, "models", file_name)

            if not os.path.exists(model_path):
                return Response({"error": "Model not found"}, status=404)

            # Load model 
            with open(model_path, "rb") as f:
                model_data = pickle.load(f)
            LOADED_MODELS[request.session.session_key] = model_data

            request.session["trained_model_info"] = {
                "filename": file_name,
                "model_name": model_data.get("model_name"),
                "resampling_method": model_data.get("resampling_method"),
                "metrics": model_data.get("metrics"),
            }
            request.session.modified = True
            return Response({
                "message": "Model loaded successfully",
                "model_metadata": request.session["trained_model_info"]
            }, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class ListModelsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    def get(self, request):
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            models_dir = os.path.join(base_dir, "models")

            if not os.path.exists(models_dir):
                return Response({"models": []}, status=200)

            files = [f for f in os.listdir(models_dir) if f.endswith(".pkl")]

            return Response({"models": files}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

def predict_single_with_trained_model(model_pkg, input_dict):
    encoder = model_pkg["encoder"]
    scaler = model_pkg["scaler"]
    model = model_pkg["model_object"]

    categorical_features = model_pkg["categorical_features"]
    numerical_features = model_pkg["numerical_features"]

    df = pd.DataFrame([input_dict])

    for col in categorical_features + numerical_features:
        if col not in df.columns:
            df[col] = None

    X_cate = encoder.transform(df[categorical_features])
    X_num = df[numerical_features].values
    X_all = hstack([X_num, X_cate])

    X_final = scaler.transform(X_all)

    pred = model.predict(X_final)[0]
    prob = model.predict_proba(X_final)[0][1]

    return int(pred), float(prob)


class PredictOneFromTrainedModelAPIView(APIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    def post(self, request):
        try:
            serializer = PredictionRecordSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=400)

            prediction_instance = serializer.save()

            # Use loaded model
            model_pkg = LOADED_MODELS.get(request.session.session_key)
            if not model_pkg:
                return Response({"error": "No trained model loaded in session"}, status=400)

            input_dict = {field: getattr(prediction_instance, field)
                          for field in prediction_instance.__dict__
                          if not field.startswith("_")}

            pred, prob = predict_single_with_trained_model(model_pkg, input_dict)

            ml_model = MLModel.objects.get(name=model_pkg["model_name"])
            prediction_instance.late_delivery_risk = pred
            prediction_instance.model_id = ml_model
            prediction_instance.save()

            return Response({
                "prediction": pred,
                "probability": prob
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class OrderForMLListView(APIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    def get(self, request):
        """Fetch orders"""
        try:
            order_id = request.query_params.get('id')  
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 20))
            search = request.query_params.get('search', '').strip()

            if order_id:
                try:
                    order = OrderForML.objects.get(id=order_id)
                    serializer = OrderForMLSerializer(order)
                    return Response({'data': serializer.data}, status=status.HTTP_200_OK)
                except OrderForML.DoesNotExist:
                    return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

            queryset = OrderForML.objects.all().order_by('id')

            if search:
                queryset = queryset.filter(
                    Q(department_name__icontains=search) |
                    Q(category_name__icontains=search) |
                    Q(customer_city__icontains=search) |
                    Q(order_city__icontains=search) |
                    Q(order_status__icontains=search)
                )

            total_count = queryset.count()

            offset = (page - 1) * page_size
            paginated_data = queryset[offset:offset + page_size]

            serializer = OrderForMLSerializer(paginated_data, many=True)

            return Response({
                'data': serializer.data,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': total_count,
                    'total_pages': (total_count + page_size - 1) // page_size
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new order"""
        try:
            serializer = OrderForMLSerializer(data=request.data)
            if serializer.is_valid():
                order = serializer.save()
                return Response({
                    'message': 'Order Created Successfully',
                    'data': OrderForMLSerializer(order).data
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrderForMLDetailView(APIView):
    permission_classes = [IsAuthenticated, IsTrainer]
    def get_object(self, pk):
        try:
            return OrderForML.objects.get(pk=pk)
        except OrderForML.DoesNotExist:
            return None
    
    def get(self, request, pk):
        """Get single order"""
        order = self.get_object(pk)
        if not order:
            return Response({'Error': 'Order Not Found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = OrderForMLSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        """Update order"""
        order = self.get_object(pk)
        if not order:
            return Response({'Error': 'Order Not Found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = OrderForMLSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Order Updated Successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete order"""
        order = self.get_object(pk)
        if not order:
            return Response({'Error': 'Order Not Found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            order.delete()
            return Response({
                'message': 'Order Deleted Successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)

