from django.middleware.csrf import get_token
from django.http import HttpResponse
from django.contrib.gis.geos import Polygon
import json
from models import Geometry

def get_geometry(request):
    if request.method == 'POST':
        data = json.loads(request.POST['data'])

    bbox = Polygon.from_bbox((data['sw_lng'], data['sw_lat'], data['ne_lng'], data['ne_lat']))
    items = Geometry.objects.filter(geom__bboverlaps=bbox).exclude(id__in=data['ids'])

    geom_json = []
    for item in items:
        geom_json.append([item.id, item.geom.coords])

    res = HttpResponse(json.dumps(geom_json), mimetype='application/json')
    res.set_cookie("csrftoken", value=get_token(request), httponly=False, secure=False)
    return res
