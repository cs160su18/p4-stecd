# chat/urls.py
from django.conf.urls import url
from django.urls import path

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    path('insight/', views.insight, name='insight'),
    path('client/', views.client, name='client'),
    path('device/', views.device, name='device'),
    url(r'^(?P<room_name>[^/]+)/$', views.room, name='room'),
]

