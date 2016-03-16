(function (window, document, $, undefined) {

    function initMap(streetNameInput, streetNoInput, latitudeInput, longiguteInput, mapDiv, location) {

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
            scrollwheel: true
        });

        var markers = [];

        map.addListener("click", function (event) {

            var point = event.latLng;
            var lat = point.lat();
            var lng = point.lng();

            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }

            while (markers.length) {
                markers.pop();
            }

            markers.push(new google.maps.Marker({
                position: { lat: lat, lng: lng },
                animation: google.maps.Animation.BOUNCE,
                map: map
            }));

            map.setCenter({ lat: lat, lng: lng });

            var url = "//maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&key=secret";

            $.getJSON(url, function (data) {
                if (data.status === "OK") {

                    var array = data.results[0].address_components;

                    for (var index = 0, total = array.length; index < total; index++) {

                        var element = array[index];
                        var typesArray = element.types;

                        if ($.inArray("route", typesArray) >= 0) {
                            $("#" + streetNameInput).val(element.short_name);
                        } else if ($.inArray("street_number", typesArray) >= 0) {
                            $("#" + streetNoInput).val(element.short_name);
                        }

                        if (document.getElementById(streetNameInput).value !== "" && document.getElementById(streetNoInput).value !== "") {
                            $("#" + latitudeInput).val(lat);
                            $("#" + longiguteInput).val(lng);

                            $("#" + latitudeInput).trigger("change");
                            //$("#" + longiguteInput).trigger("change");
                            break;
                        }
                    }
                } else {
                    alert(data.error_message);
                }
            });
        });

        function updateCoordinates(markers, map) {

            if (document.getElementById(streetNameInput).value === "" ||
				document.getElementById(streetNoInput).value === "") {
                return;
            }

            var streetName = $("#" + streetNameInput).val();
            var streetNo = $("#" + streetNoInput).val();

            var address = streetName + "," + streetNo + ",Bucuresti,Romania";
            var space = " ";
            space = space.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            address = address.replace(new RegExp(space, "g"), "+");

            var url = "//maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=secret";

            $.getJSON(url, function (data) {
                if (data.status === "OK") {

                    var location = data.results[0].geometry.location;
                    var lat = location.lat;
                    var lng = location.lng;

                    $("#" + latitudeInput).val(lat);
                    $("#" + longiguteInput).val(lng);

                    $("#" + latitudeInput).trigger("change");
                    //$("#" + longiguteInput).trigger("change");

                    for (var i = 0; i < markers.length; i++) {
                        markers[i].setMap(null);
                    }

                    while (markers.length) {
                        markers.pop();
                    }

                    markers.push(new google.maps.Marker({
                        position: { lat: lat, lng: lng },
                        animation: google.maps.Animation.BOUNCE,
                        map: map
                    }));

                    map.setCenter({ lat: lat, lng: lng });

                } else {
                    alert(data.error_message);
                }
            });
        }

        $("#" + streetNameInput).keyup(function () {
            updateCoordinates(markers, map);
        });

        $("#" + streetNoInput).keyup(function () {
            updateCoordinates(markers, map);
        });
    }

    var defaultLocation = {
        lat: 44.4469109,
        lng: 26.0952531
    };

    function updateDistance(latitudeInput1, longiguteInput1, latitudeInput2, longiguteInput2, distanceInput) {

        if (document.getElementById(latitudeInput1).value === "" ||
			document.getElementById(longiguteInput1).value === "" ||
            document.getElementById(latitudeInput2).value === "" ||
            document.getElementById(longiguteInput2).value === "") {
            return;
        }

        var lat1 = $("#" + latitudeInput1).val();
        var lng1 = $("#" + longiguteInput1).val();
        var lat2 = $("#" + latitudeInput2).val();
        var lng2 = $("#" + longiguteInput2).val();

        var url = "//maps.googleapis.com/maps/api/directions/json?origin=" + lat1 + "," + lng1 + "&destination=" + lat2 + "," + lng2 + "&avoid=highways&mode=driving&key=secret";


        $.ajax({
            url: url,
            type: "GET",
            crossDomain: true,
            success: function (data) {
                if (data.status === "OK") {
                    if (data.routes.length !== 0 && data.routes[0].legs !== undefined && data.routes[0].legs.length !== 0) {
                        $("#" + distanceInput).val(data.routes[0].legs[0].distance.value);
                    }
                } else {
                    alert(data.error_message);
                }
            },
            error: function (xhr, status) {
                alert("error: " + status);
            }
        });
    };

    $(document).ready(function () {

        initMap('streetName1', 'streetNo1', 'latitude1', 'longitude1', 'map1', defaultLocation);
        initMap('streetName2', 'streetNo2', 'latitude2', 'longitude2', 'map2', defaultLocation);

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