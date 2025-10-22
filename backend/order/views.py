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
                        "label": "payment_method",
                        "value": "total_sales",
                        "unit": "USD",
                        "data": data_list
                    }
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
               return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
