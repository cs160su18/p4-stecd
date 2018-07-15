from django.shortcuts import render
from django.utils.safestring import mark_safe
import json

def index(request):
    return render(request, 'draw/index.html', {})

def room(request, room_name):
    return render(request, 'draw/room.html', {
        'room_name_json': mark_safe(json.dumps(room_name))
    })
  
def insight(request):
    return render(request, 'draw/insightboard.html', {})
  
def client(request):
  return render(request, 'draw/mobile.html', {})

  
def device(request):
    return render(request, 'draw/device.html', {})