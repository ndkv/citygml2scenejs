from django.shortcuts import render_to_response
from django.middleware.csrf import get_token
from django.http import HttpResponse
from django.contrib.gis.geos import Polygon
import json
from models import Geometry
from django.template import RequestContext
from django.core.context_processors import csrf

def map(request):
    return render_to_response('cgml2sjs/index.htm', csrf(request), context_instance=RequestContext(request))

def get_geometry(request):
    if request.method == 'POST':
        data = json.loads(request.POST['data'])

    bbox = Polygon.from_bbox((data['sw_lng'], data['sw_lat'], data['ne_lng'], data['ne_lat']))
    items = Geometry.objects.filter(geom__bboverlaps=bbox).exclude(id__in=data['ids'])

    geom_json = []
    for item in items:
        geom_json.append([item.id, item.geom.coords])

    return HttpResponse(json.dumps(geom_json), mimetype='application/json')
