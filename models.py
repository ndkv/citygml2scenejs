#from django.db import models
from django.contrib.gis.db import models

# Create your models here.

class Geometry(models.Model):
    tile_id = models.TextField()
    geom = models.PolygonField()

    objects = models.GeoManager()


