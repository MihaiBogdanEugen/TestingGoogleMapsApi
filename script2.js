var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

var bucharestGeofence = [{ "lat": 44.4923421, "lng": 25.9902191 }, { "lat": 44.4651510, "lng": 25.9733963 }, { "lat": 44.4475068, "lng": 26.0183716 }, { "lat": 44.4426047, "lng": 25.9665298 }, { "lat": 44.4080331, "lng": 25.9771729 }, { "lat": 44.4050899, "lng": 26.0118484 }, { "lat": 44.3808028, "lng": 26.0427475 }, { "lat": 44.3675510, "lng": 26.0997391 }, { "lat": 44.3395652, "lng": 26.1471176 }, { "lat": 44.3734411, "lng": 26.1450577 }, { "lat": 44.4202949, "lng": 26.2243652 }, { "lat": 44.4604954, "lng": 26.1608505 }, { "lat": 44.4982195, "lng": 26.1120987 }, { "lat": 44.5425264, "lng": 26.1024857 }, { "lat": 44.5222131, "lng": 26.0235214}];	

function isPointInside(polygon, point) {

    var result = false;
    var j = polygon.length - 1;

    for (var i = 0; i < polygon.length; i++)
    {
        if (polygon[i].lng < point.lng && polygon[j].lng >= point.lng || polygon[j].lng < point.lng && polygon[i].lng >= point.lng)
        {
            if (polygon[i].lat + (point.lng - polygon[i].lng) / (polygon[j].lng - polygon[i].lng) * (polygon[j].lat - polygon[i].lat) < point.lat)
            {
                result = !result;
            }
        }
        j = i;
    }
    return result;    
}

function isPointInsideBucharest(lat, lng) {

    return isPointInside(bucharestGeofence, { 
        lat: lat, 
        lng: lng 
    });
}

function geocodeAddress(geocoder, streetNameAndNoInput, latitudeInput, longitudeInput, map, markers) {

    if (document.getElementById(streetNameAndNoInput).value === "") {
        return;
    }

    var streetNameAndNo = document.getElementById(streetNameAndNoInput).value;

    var address = streetNameAndNo + ",Bucuresti,Romania";
    var space = " ";
    space = space.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    address = address.replace(new RegExp(space, "g"), "+");

    geocoder.geocode({ 'address': address }, function (results, status) {

        if (status === google.maps.GeocoderStatus.OK && results[0]) {

            var point = results[0].geometry.location;

            if(addMarkerToMap(map, markers, point.lat(), point.lng()) === false)
            {
                $("#" + streetNameAndNoInput).val('');
                $("#" + latitudeInput).val('');
                $("#" + longitudeInput).val('');
            }

            $("#" + latitudeInput).val(point.lat());
            $("#" + longitudeInput).val(point.lng());

            $("#" + latitudeInput).trigger("change");
            //$("#" + longitudeInput).trigger("change");

        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}

function geocodeLatLng(geocoder, streetNameAndNoInput, latitudeInput, longitudeInput) {

    if (document.getElementById(latitudeInput).value === "" ||
		document.getElementById(longitudeInput).value === "") {
        return;
    }

    var lat = document.getElementById(latitudeInput).value;
    var lng = document.getElementById(longitudeInput).value;

    geocoder.geocode({ 'location': { lat: parseFloat(lat), lng: parseFloat(lng)} }, function (results, status) {

        if (status === google.maps.GeocoderStatus.OK) {

            $("#" + streetNameAndNoInput).val('');

            if (results[0]) {

                var address = results[0].formatted_address;
                $("#" + streetNameAndNoInput).val(address);

                if (document.getElementById(streetNameAndNoInput).value !== "") {

                    $("#" + latitudeInput).trigger("change");
                    //$("#" + longitudeInput).trigger("change");
                }
            } else {
                window.alert('No results found! Please enter the street name and number manually!');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}

function addMarkerToMap(map, markers, lat, lng) {

    var position = { 
        lat: lat, 
        lng: lng 
    };

    if (isPointInsideBucharest(lat, lng) === false) {
        window.alert('This location is outside Bucharest');
        return false;
    }

    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }

    while (markers.length) {
        markers.pop();
    }

    markers.push(new google.maps.Marker({
        position: position,
        animation: google.maps.Animation.BOUNCE,
        map: map
    }));

    map.setCenter(position);
    return true;
}

function initMap(streetNameAndNoInput, latitudeInput, longitudeInput, mapDiv, location, geocoder) {

    var map = new google.maps.Map(document.getElementById(mapDiv), {
        center: location,
        zoom: 15,
        panControl: true,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        overviewMapControl: true,
        rotateControl: true,
        scrollwheel: true,
        disableDoubleClickZoom: false,
        keyboardShortcuts: true
    });

    var markers = [];

    map.addListener("click", function (event) {

        var lat = event.latLng.lat();
        var lng = event.latLng.lng();

        $("#" + latitudeInput).val(lat);
        $("#" + longitudeInput).val(lng);

        if(addMarkerToMap(map, markers, lat, lng) === false)
        {
            $("#" + streetNameAndNoInput).val('');
            $("#" + latitudeInput).val('');
            $("#" + longitudeInput).val('');
        }

        geocodeLatLng(geocoder, streetNameAndNoInput, latitudeInput, longitudeInput);
    });

    function updateCoordinates(geocoder, streetNameAndNoInput, latitudeInput, longitudeInput, map, markers) {

        if (document.getElementById(streetNameAndNoInput).value === "") {
            return;
        }

        geocodeAddress(geocoder, streetNameAndNoInput, latitudeInput, longitudeInput, map, markers);
    }

    $("#" + streetNameAndNoInput).keyup(function () {
        delay(function(){
            updateCoordinates(geocoder, streetNameAndNoInput, latitudeInput, longitudeInput, map, markers);
        }, 500 );
    });
}

function initMaps() {
    
    var geocoder = new google.maps.Geocoder();
    var defaultLocation = {
        lat: 44.4469109,
        lng: 26.0952531
    };

    initMap('streetNameAndNo1', 'latitude1', 'longitude1', 'map1', defaultLocation, geocoder);
    initMap('streetNameAndNo2', 'latitude2', 'longitude2', 'map2', defaultLocation, geocoder);
}

function updateDistance(latitudeInput1, longitudeInput1, latitudeInput2, longitudeInput2, distanceInput) {

    if (document.getElementById(latitudeInput1).value === "" ||
		document.getElementById(longitudeInput1).value === "" ||
        document.getElementById(latitudeInput2).value === "" ||
        document.getElementById(longitudeInput2).value === "") {
        return;
    }

    $("#" + distanceInput).val('');

    var origin = { 
        lat: parseFloat($("#" + latitudeInput1).val()), 
        lng: parseFloat($("#" + longitudeInput1).val()) 
    };

    var destination = { 
        lat: parseFloat($("#" + latitudeInput2).val()), 
        lng: parseFloat($("#" + longitudeInput2).val()) 
    };

    var service = new google.maps.DistanceMatrixService;
    service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: true
    }, function (response, status) {

        if (status === google.maps.DistanceMatrixStatus.OK && response.rows[0] && response.rows[0].elements[0]) {

            $("#" + distanceInput).val(response.rows[0].elements[0].distance.value);

        } else {
            window.alert('DistanceMatrixService failed due to: ' + status);
        }
    });
}

(function (window, document, $, undefined) {
    $(document).ready(function () {

        $("#latitude1").change(function () {
            updateDistance('latitude1', 'longitude1', 'latitude2', 'longitude2', 'distance');
        });
        $("#longitude1").change(function () {
            updateDistance('latitude1', 'longitude1', 'latitude2', 'longitude2', 'distance');
        });
        $("#latitude2").change(function () {
            updateDistance('latitude1', 'longitude1', 'latitude2', 'longitude2', 'distance');
        });
        $("#longitude2").change(function () {
            updateDistance('latitude1', 'longitude1', 'latitude2', 'longitude2', 'distance');
        });
    });
})(window, document, window.jQuery);