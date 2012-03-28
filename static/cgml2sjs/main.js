var map;
var server = "http://localhost:8000/";
var loaded_geoms = [];

$(document).ready(function () {
    initialize_map();
//    get_geometry();

});

function initialize_map() {
    var lat_lng = new google.maps.LatLng(51.9000284, 4.482482);
    var options = {
        zoom: 16,
        center: lat_lng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDoubleClickZoom: true
    };

    map = new google.maps.Map(document.getElementById("map_canvas"), options);

    google.maps.event.addListener(map, 'dragend', function () {
        get_geometry(map.getBounds());
    });
}

function get_geometry(bounds) {
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();
    var ids; 

    if (loaded_geoms.length === 0) {
        ids = "None";
    } else {
        ids = loaded_geoms[0];
        console.log(loaded_geoms.length)
        for (var i=1; i < (loaded_geoms.length - 1); i++) {
            ids = ids + ' ' +  loaded_geoms[i];
        }
    }

    console.log(ids)

    $.get(server + 'get_geometry/', {"ids": ids, "sw_lat": sw.lat(), "sw_lng": sw.lng(), "ne_lat": ne.lat(), "ne_lng": ne.lng()},  function(data) {
        
        var parsed = $.parseJSON(data);
        $.each(parsed, function(index, building) {
                loaded_geoms.push(building[0]);
                draw_geometry(building[1]);
        })
    }).error(function(request, error) {
        if (request.status === 0) { console.log('Same origin policy?'); }
    });
}

function draw_geometry(footprint) {
    var coordinates = footprint;
    var path = [];

    $.each(coordinates[0], function(index, coordinate_pair) {
        var lat = parseFloat(coordinate_pair[1]);
        var lon = parseFloat(coordinate_pair[0]);
        path.push(new google.maps.LatLng(lat, lon));
    });

    path.pop();
    return build_geometry(path);
}

function build_geometry(geometry_coordinates) {
    var geom = new google.maps.Polygon({
        paths: geometry_coordinates,
        strokeColor: "#FF0000", 
        strokeOpacity: 0.8,
        strokeWeight: 2, 
        fillColor: "#FF0000", 
        fillOpacity: 0.35
    });

    geom.setMap(map);
    return geom;
}




