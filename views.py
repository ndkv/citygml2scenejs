from django.shortcuts import render_to_response
from django.middleware.csrf import get_token
from django.http import HttpResponse
from django.contrib.gis.geos import Polygon, GEOSGeometry
import json
from models import Geometry
from django.template import RequestContext
from django.core.context_processors import csrf

def map(request):
    return render_to_response('cgml2sjs/index.htm', csrf(request), context_instance=RequestContext(request))

def get_geometry(request):
    if request.method == 'POST':
        data = json.loads(request.POST['data'])
        start = data['start_bounds']
        end = data['end_bounds']
        bbstart = Polygon.from_bbox((start[0], start[1], start[2], start[3]))
        bbend = Polygon.from_bbox((end[0], end[1], end[2], end[3]))

        query_poly = bbend.difference(bbstart)
        explored = GEOSGeometry(data['explored_area'])

        items = Geometry.objects.filter(geom__intersects=query_poly).exclude(geom__intersects=explored)
#        items = Geometry.objects.filter(geom__within=query_poly).exclude(geom__within=explored)
        geom_json = []
        for item in items:
            geom_json.append([item.id, item.geom.coords])

        geom_json.append(["explored_area", query_poly.union(explored).wkt])

        return HttpResponse(json.dumps(geom_json), mimetype='application/json')

def initialize(request):
    if request.method == 'POST':
        data = json.loads(request.POST['data'])

        bbox = Polygon.from_bbox((data['sw_lng'], data['sw_lat'], data['ne_lng'], data['ne_lat']))
        items = Geometry.objects.filter(geom__bboverlaps=bbox)

        geom_json = []
        for item in items:
            geom_json.append([item.id, item.geom.coords])

        geom_json.append(["explored_area", bbox.wkt])

        return HttpResponse(json.dumps(geom_json), mimetype='application/json')
