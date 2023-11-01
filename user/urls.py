from django.urls import path
from . import views


app_name = 'user'


urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
]
