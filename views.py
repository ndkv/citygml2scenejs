from django.http import HttpResponse
from django.contrib.gis.geos import Polygon
import json
from models import Geometry

def get_geometry(request):
    sw_lat = request.GET['sw_lat']
    sw_lng= request.GET['sw_lng']
    ne_lat = request.GET['ne_lat']
    ne_lng = request.GET['ne_lng']

    bbox = Polygon.from_bbox((sw_lng, sw_lat, ne_lng, ne_lat))
    items = Geometry.objects.filter(geom__bboverlaps=bbox)

    geom_json = {}
    for item in items:
        if item.tile_id in geom_json:
            geom_json[item.tile_id]['coords'].append(item.geom.coords)
        else:
            geom_json[item.tile_id] = {'coords':[]}
    
    return HttpResponse(json.dumps(geom_json))
