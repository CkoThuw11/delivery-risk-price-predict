from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg, Min, Max,Q
from django.db.models.functions import TruncMonth
from order.models import OrderRecord

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
                avg_late_rate=Avg("Late_delivery_risk")  # nếu bạn có cột này
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
                .order_by("-total_sales")[:10]
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
                {"product": p["Order_Region"], "sales": p["total_sales"]}for p in top_10_sales_region
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
                    "late_rate": kpi_cards["avg_late_rate"]
                },
                "revenue_over_time":{
                    "chart_type":"line",
                    "x_axis": "month",
                    "y_axis": "sales",
                    "unit": "USD",
                    "data":[revenue_over_time_data]
                },
                "sales_by_customer_group":{
                    "chart_type": "pie",
                    "label": "segment",
                    "value": "sales",
                    "unit": "USD",
                    "data": [sales_by_customer_group_data]
                },
                "":{
                    "chart_type": "bar",
                    "label": "category_name",
                    "value": "sales",
                    "unit": "USD",
                    "data": [top_10_products_data]
                },
                "late_risk_over_time": {
                    "chart_type": "line_area",
                    "x_axis": "month",
                    "y_axis": "late_rate",
                    "unit": "percentage",
                    "data": [late_risk_over_time_data]
                },
                "top_10_sales_region":{
                    "chart_type": "bar_horizontal",
                    "label": "region",
                    "value": "sales",
                    "unit": "USD",
                    "data": [top_10_sales_region_data]
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
                    "revenue_by_payment_method": {
                        "chart_type": "bar",
                        "label": "Type",
                        "value": "total_sales",
                        "unit": "USD",
                        "data": data_list
                    }
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
                    "revenue_by_market": {
                        "chart_type": "pie",
                        "label": "Market",
                        "value": "total_sales",
                        "unit": "USD",
                        "data": data_list
                    }
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
                    "sales_by_region": {
                        "chart_type": "bar",
                        "label": "region",
                        "value": "total_sales",
                        "unit": "USD",
                        "filter_field": "market",
                        "default_filter": "Africa",
                        "data": data_by_market
                    }
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
                    "late_delivery_rate_by_region": {
                        "chart_type": "bar",
                        "label": "region",
                        "value": "late_rate",
                        "unit": "percentage",
                        "filter_field": "market",
                        "default_filter": "Africa",
                        "data": data_by_market
                    }
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
                    "department_delivery_status": {
                        "chart_type": "bar",
                        "label":"department_name",
                        "value":["On_Time", "Late"],
                        "unit": "orders",
                        "stacked": True,
                        "data": [data]
                    }
                }   
                .values("Shipping_Mode")
                .annotate(
                    total_orders = Count("Order_Id"),
                )
            )
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

            ordersbyshippingmode=[{"ShippingMode":r["Shipping_Mode"],"Orders":r["total_orders"]} for r in queryset]

            response_data = {
                "charts": {
                    "shipping_mode_distribution": {
                    "chart_type": "pie",
                    "label": "ShippingMode",
                    "value": "Orders",
                    "unit": "",
                    "data": [ordersbyshippingmode]
                    }
                }
            }
            return Response(response_data, status=status.HTTP_200_OK)

       except Exception as e:
             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    

