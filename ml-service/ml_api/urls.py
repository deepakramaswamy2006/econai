from django.urls import path
from .views import predict_gdp, predict_crisis, predict_inflation, historical_data

urlpatterns = [
    path("predict-gdp", predict_gdp),
    path("predict-crisis", predict_crisis),
    path("predict-inflation", predict_inflation),
    path("historical-data", historical_data),
]