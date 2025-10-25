from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from order.models import OrderRecord

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
                    "cateogory_name": r["Category_Name"],  "On_Time": r["total_on_time"], 
                    "Late": r["total_late"] } for r in queryset]

            response_data = {
                "charts": {
                    "category_delivery_status": {
                    "chart_type": "bar",
                    "label": "category_name",
                    "value": ["On_Time", "Late"],
                    "unit": "orders",
                    "stacked": True,
                    "data": [data]
                    }
                }   
            }
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)