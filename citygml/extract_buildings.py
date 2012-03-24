import os
import pyproj
from lxml import etree

class RDToWGS84:
    def __init__(self):
        '''Convert RD to lat/lon'''
        self.wgs84 = pyproj.Proj(init='epsg:4326')
        self.RD = pyproj.Proj('+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs')
        
    def transform(self, x, y):
#        return pyproj.transform(self.wgs84, self.RD, x, y)
        return pyproj.transform(self.RD, self.wgs84, x, y)

class Footprints:
    def __init__(self, tree, ns):
        self.tree = tree
        self.ns = ns
        self.geom = self.tree.xpath('//bldg:GroundSurface', namespaces=self.ns)
        self.transformer = RDToWGS84()
        
    def as_wkt(self):
        geom = self.tree.xpath('//bldg:GroundSurface/descendant::gml:posList', namespaces=self.ns)
        polygons = []

        for element in geom:
            coords = element.text.split(' ')
            query = "POLYGON(("
            
            for j in range(0, len(coords) - 3, 3):
                lon, lat = self.transformer.transform(coords[j], coords[j+1])
                query += "%s %s, " % (lon, lat)
                
#            for j in range(0, len(coords) - 3, 3):
#                lon, lat = coords[j], coords[j+1]
#                query += "%s %s, " % (lon, lat)
                
            lon, lat = self.transformer.transform(coords[-3], coords[-2])
#            lon, lat = coords[-3], coords[-2]
            query += "%s %s))" % (lon, lat)

            polygons.append(query)
        
        return polygons

class CityGML:
    def __init__(self, tile):
        self.tile = tile
        xmlparser = etree.XMLParser()
        self.tree = etree.parse('data/%s/%s.xml' % (tile, tile.upper()) , parser=xmlparser)

        self.ns = {'ns':'http://www.opengis.net/citygml/1.0',
        'bldg':'http://www.opengis.net/citygml/building/1.0',
        'gml':'http://www.opengis.net/gml'}

    def footprints_all_aswkt(self):
        return Footprints(self.tree, self.ns).as_wkt()

#    def footprints_all_sql(self, path, start):
#        dbase = 'cgml2sjs_geometry'
#
#        footprints = Footprints(self.tree, self.ns)
#        as_wkt = footprints.as_wkt()
#        
#        coordinates = open(path, 'w')
#        lines = []
#
#        for i, footprint in enumerate(as_wkt):
#    
#            line = "INSERT INTO %s VALUES (%s, '%s', ST_GeomFromEWKT('SRID=4326;%s'));\n" % (dbase, i+start, self.tile, footprint)
#            coordinates.write(line)
#
##        return Footprint(self.tree, self.ns, dbase)
#
#        coordinates.close()
        
def main():
    f_all = open('all.sql', 'w')
#    dbase = 'cgml2sjs_geometry'
    dbase = 'citygml2scenejs_geometry'
    i = 0

    for tile in os.listdir('./data'):
        mesh = CityGML(tile)
        footprints = mesh.footprints_all_aswkt()
        
        for footprint in footprints:
            line = "INSERT INTO %s VALUES (%s, '%s', ST_GeomFromText('%s', 4326));\n" % (dbase, i, tile, footprint)
#            line = "INSERT INTO %s VALUES (%s, '%s', ST_GeomFromText('%s', 28992));\n" % (dbase, i, tile, footprint)
            f_all.write(line)
            i += 1

        print tile

    f_all.close()

if __name__ == '__main__':
    main()
