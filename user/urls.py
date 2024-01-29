from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView


app_name = 'user'


urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    path('profile/list', views.UserListView.as_view(), name='userList'),
    # path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('profile/upload_excel/', views.upload_excel, name='upload-excel'),
    path('change_password/', views.change_password, name='change_password'),
]
