from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.db.models import Sum
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
        