var map;
var directionsManager;
var myLocation;
var locationData;
//Query URL to the PointsOfInterest data source
var sdsDataSourceUrl = 'http://spatial.virtualearth.net/REST/v1/data/Microsoft/PointsOfInterest';

function GetMap() {
    navigator.geolocation.getCurrentPosition(successCallback,errorCallback); 
    //CREATE INSTANCE OF THE MAP
    map = new Microsoft.Maps.Map('#myMap', {
        credentials:'Ar0vZ-H8d-P-2ZCA8iWdECkXA0DW8fDpsvekJuGcczR5GtN35cIcOMIqzKTpEHRT',
        // center: new Microsoft.Maps.Location(latitude,longitude)
    });
    infobox = new Microsoft.Maps.Infobox(map.getCenter(),{visible:true});
    infobox.setMap(map);
    // Microsoft.Maps.loadModule('Microsoft.Maps.SpatialDataService', function () {
    //     findByPropperty();
    //  });
    //Load the directions module.
}//end function


const successCallback = (position) => {
    console.log(position);
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    console.log(latitude);
    console.log(longitude);

     
    myLocation = new Microsoft.Maps.Location(latitude,longitude);

    currentLocationPushPin = new Microsoft.Maps.Pushpin(myLocation, {
        title: 'ME',
        color: 'red'
    });

    map.entities.push(currentLocationPushPin);
    Microsoft.Maps.Events.addHandler(currentLocationPushPin, 'mouseover', function (e) {
        e.target.setOptions({ color: 'blue'});
    });
    Microsoft.Maps.Events.addHandler(currentLocationPushPin, 'mouseout', function (e) {
        e.target.setOptions({ color: 'red' });
    });
}
const errorCallback = (error) => {
    console.log(error);

}
function LoadDirections(destination) {

        //Create an instance of the directions manager.
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map); //<-- pass map to render directions on

        // //Create waypoints to route between.
        directionsManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ location: myLocation }));
        directionsManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ address: destination}));
        // directionsManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ address: 'Athens, GR' }));
        // directionsManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ address: 'Madrid, ES' }));


        var requestOptionsData = {
            distanceUnit: Microsoft.Maps.Directions.DistanceUnit.km,
            routeAvoidance: [Microsoft.Maps.Directions.RouteAvoidance.avoidLimitedAccessHighway]
        };

        //Set the request options that avoid highways and uses kilometers.
        directionsManager.setRequestOptions(requestOptionsData);

        //Make the route line thick and green. Replace the title of waypoints with an empty string to hide the default text that appears.
        var routeStyleData = {
            drivingPolylineOptions: { strokeColor: 'green', strokeThickness: 6 },
            waypointPushpinOptions: { title: '' }
        }

        directionsManager.setRenderOptions(routeStyleData);

        //Calculate directions.
        directionsManager.calculateDirections();
   
}
function findByPropperty(propertyCode) {
    //Remove any existing data from the map.
    map.entities.clear();

    // place current location pin
    map.entities.push(currentLocationPushPin);


    //Create a query to get nearby data.
    var queryOptions = {
        queryUrl: sdsDataSourceUrl,
        spatialFilter: {
            spatialFilterType: 'nearby',
            location: myLocation,
            radius: 25},
        filter: new Microsoft.Maps.SpatialDataService.Filter('EntityTypeID', 'eq', propertyCode) //Filter to retrieve Entities.
    };

    //Process the query.
    Microsoft.Maps.SpatialDataService.QueryAPIManager.search(queryOptions, map, function (data) {
        //Add results to the map.
        locationData = data;
        
        locationPins = createCustomPushpins(data);
        map.entities.push(locationPins);
        console.log(locationPins);
        // console.log(data[0].metadata.Name);
        createPushpinList(locationPins);
        
    });

    
}
//functions to load different points of interest
function loadSchools(){
    Microsoft.Maps.loadModule('Microsoft.Maps.SpatialDataService', function () {
        findByPropperty(8211)});
        
}

function loadRestaurants(){
    Microsoft.Maps.loadModule('Microsoft.Maps.SpatialDataService', function () {
        findByPropperty(5800)});
}
//pushpin functions
function createCustomPushpins(data) {
    //Generate Pushpin for each location
    var pins = [];
    var location;
    console.log(data[0].metadata.latitude);

    for (var index = 0; index < data.length; index++) {
        //Create a title for each pushpin.
        location = new Microsoft.Maps.Location(data[index].metadata.Latitude,data[index].metadata.Longitude);
            console.log("got location")
            pins[index] = new Microsoft.Maps.Pushpin(location, {
            title: data[index].metadata.Name,
            location: data[index].metadata.location,
            
            color: 'red'
        });

        pins[index].metadata = {
            description: 'Name: ' + data[index].metadata.Name + '\n' +
            'Address: ' +data[index].metadata.AddressLine,
        }
        Microsoft.Maps.Events.addHandler(pins[index], 'mouseover', function (e) {
            e.target.setOptions({ color: 'blue'});
        });
        Microsoft.Maps.Events.addHandler(pins[index], 'mouseout', function (e) {
            e.target.setOptions({ color: 'red' });
        });

        Microsoft.Maps.Events.addHandler(pins[index], 'click', pushpinClicked);
    }

    return pins;
}//end function
function createPushpinList(pushPins) {
    //Create a list of displayed pushpins each time clustering layer updates.

    if (pushPins != null) {
        // infobox.setOptions({ visible: false });
        console.log('started function');
        // Get all pushpins that are currently displayed.
        // var data = clusterLayer.getDisplayedPushpins();
        var output = [];

        // Create a list of links for each pushpin that opens up the infobox for it.
        for (var index = 0; index < pushPins.length; index++) {
            // output[index] = pushPins[index].getTitle();
            output.push("<button onclick='listItemClicked(pushPins[index])'>");
            output.push(pushPins[index].getTitle(), "</button><br/>");
            // console.log(pushPins[index].getTitle());
        }
        document.getElementById('listOfPins').innerHTML = output;
        

    }
}
function pushpinClicked(e) {
    //Make sure the infobox has metadata to display.
    console.log('started pushpinClicked')
        infobox.setOptions({
            location: e.target.getLocation(),
            title: e.target.title,
            description: e.target.metadata.description,
            visible: true,
            maxWidth: 500
        });
        Microsoft.Maps.loadModule('Microsoft.Maps.Directions', LoadDirections(e.target.getLocation()) );
    
}
function listItemClicked(pushPin){
console.log('started function')
    infobox.setOptions({
        location: pushPin.getLocation(),
        title: pushPin.title,
        description: pushPin.metadata.description,
        visible: true,
        maxWidth: 500
    });
}
