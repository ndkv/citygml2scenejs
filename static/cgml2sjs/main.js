var map;
var server = "http://localhost:8000/";
var loaded_geoms = [];
var drag_start_bounds;
var explored_area = "";

$(document).ready(function () {
    set_up_ajax();
    initialize_map();

});

function initialize_map() {
    var lat_lng = new google.maps.LatLng(51.9000284, 4.482482);
    var options = {
        zoom: 17,
        center: lat_lng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDoubleClickZoom: true
    };


    map = new google.maps.Map(document.getElementById("map_canvas"), options);

    google.maps.event.addListener(map, 'dragstart', function () {
        drag_start_bounds = map.getBounds();
    });
    google.maps.event.addListener(map, 'dragend', function () {
        get_consecutive(map.getBounds(), drag_start_bounds);
    });
    google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
        initialize(map.getBounds());
    });
}

function initialize(bounds) {
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();
    
    data_send = JSON.stringify({'ids': loaded_geoms, "sw_lat": sw.lat(), "sw_lng": sw.lng(), "ne_lat": ne.lat(), "ne_lng": ne.lng()});

    get_geometry('initialize/', data_send);

}

function get_consecutive(end_bounds, start_bounds) {
    var e_sw = end_bounds.getSouthWest();
    var e_ne = end_bounds.getNorthEast();

    var s_sw = start_bounds.getSouthWest();
    var s_ne = start_bounds.getNorthEast();

    data_send = JSON.stringify({"end_bounds": [e_sw.lng(),e_sw.lat(), e_ne.lng(), e_ne.lat()], "start_bounds": [s_sw.lng(), s_sw.lat(), s_ne.lng(), s_ne.lat()], "explored_area":explored_area});

    get_geometry('get_geometry/', data_send)
}

function get_geometry(func, data) {
    $.post(server + func, {'data':data}, function(data) {
        $.each(data, function(index, building) {
            if (building[0] == "explored_area") {
                explored_area = building[1];
            } else {
                loaded_geoms.push(building[0]);
                draw_geometry(building[1], building[0]);
            }
        })
    }).error(function(request, error) {
        if (request.status === 0) { console.log('Same origin policy?'); }
    });
}

function draw_geometry(footprint, id) {
    var coordinates = footprint;
    var path = [];

    $.each(coordinates[0], function(index, coordinate_pair) {
        var lat = parseFloat(coordinate_pair[1]);
        var lon = parseFloat(coordinate_pair[0]);
        path.push(new google.maps.LatLng(lat, lon));
    });

    path.pop();

    var geom = new google.maps.Polygon({
        paths: path,
        strokeColor: "#FF0000", 
        strokeOpacity: 0.8,
        strokeWeight: 2, 
        fillColor: "#FF0000", 
        fillOpacity: 0.35
    });

    geom.citygml_id = id;

    google.maps.event.addListener(geom, 'click', function () {
        alert("Building id: " + this.citygml_id);
    });

    geom.setMap(map);
    return geom;
}

function set_up_ajax() {
    jQuery(document).ajaxSend(function(event, xhr, settings) {
        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        function sameOrigin(url) {
            // url could be relative or scheme relative or absolute
            var host = document.location.host; // host + port
            var protocol = document.location.protocol;
            var sr_origin = '//' + host;
            var origin = protocol + sr_origin;
            // Allow absolute or scheme relative URLs to same origin
            return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
                (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
                // or any other URL that isn't scheme relative or absolute i.e relative.
                !(/^(\/\/|http:|https:).*/.test(url));
        }
        function safeMethod(method) {
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }
        
        if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        }
    });
}
