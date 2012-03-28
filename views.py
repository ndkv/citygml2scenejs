from django.http import HttpResponse
from django.contrib.gis.geos import Polygon
import json
from models import Geometry
from time import time
import pudb

def get_geometry(request):
    sw_lat = request.GET['sw_lat']
    sw_lng= request.GET['sw_lng']
    ne_lat = request.GET['ne_lat']
    ne_lng = request.GET['ne_lng']
    ids_r = request.GET['ids']

    bbox = Polygon.from_bbox((sw_lng, sw_lat, ne_lng, ne_lat))
    if ids_r != 'None':
        ids_l = ids_r.split(' ')
        items = Geometry.objects.filter(geom__bboverlaps=bbox).exclude(id__in=ids_l)
    else:
        items = Geometry.objects.filter(geom__bboverlaps=bbox)

    geom_json = []

    a = time()
    for item in items:
        geom_json.append([item.id, item.geom.coords])
    print time() - a

    return HttpResponse(json.dumps(geom_json))
