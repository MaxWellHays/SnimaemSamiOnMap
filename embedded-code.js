function initializeMap() {
	myMap = new ymaps.Map('map-box', {
	    center: [59.92095082, 30.36707118],
	    zoom: 11,
	    controls: [],
	    behaviors: ['scrollZoom','drag']
	  });
	var zoomControl = new ymaps.control.ZoomControl({
	    options: {
	        size: "small",
	        position: {
	            top: 10,
	            left: 10
	        }
	    }
	});
	myMap.controls.add(zoomControl);
}

function initializePageNumberForm()
{
	pageNumber = $.query.get("pageNumber");
	if (!pageNumber)
	{
		pageNumber = 5;
	}
	$("#pageNumberNumerator").val(pageNumber);
	$("#pageNumberForm").submit(function( event ) {
	  window.location.search = jQuery.query.set("pageNumber", $("#pageNumberNumerator").val());
	  event.preventDefault();
	});
}

function uniq(a) {
   return Array.from(new Set(a));
}

function clarifyParamsString(params) {
	var parts = uniq(params.split("&"));
	parts = parts.filter(function(item){
		return item.lastIndexOf("p=")<0
	});
	return parts.join("&");
}

function addObjectToMap(link, name, address, price) {
	$.ajax({
  	url: "https://geocode-maps.yandex.ru/1.x/?format=json&geocode=" + address,
  	async: true,
  	dataType: 'json',
  	success: function(data) {
  		var coords = data.response.GeoObjectCollection.featureMember["0"].GeoObject.Point.pos;
  		myPlacemark = new ymaps.Placemark([coords.split(" ")[1], coords.split(" ")[0]],
        { balloonContentHeader: "<a href=\"" + link + "\">" + price + " " + name + "</a>" });
  		myMap.geoObjects.add(myPlacemark);
  	}
  });
}

function handleAd(i, adLink)
{
	jQuery.get(adLink, function(data){
		var page = jQuery.parseHTML(data);
		var address = $(page).find(".data_object")[0].firstChild.data.trim();
		var name = $(page).find(".info_object h2")[0].innerText.trim();
		var price = $(page).find(".price_object")[0].innerText.trim();
		addObjectToMap(this.url, name, address, price);
	});
}

var pageNumber;
var myMap;
initializeMap();
initializePageNumberForm();

var objectsRequest = "";
var requestStarts = window.location.href.lastIndexOf("?");
if (requestStarts > 0)
{
	objectsRequest = clarifyParamsString(window.location.href.substring(requestStarts+1));
}

for (var i = 1; i <= pageNumber; i++) {
	var requestPage = "/objects?p=" + i + objectsRequest;
	jQuery.get(requestPage, function(data) {
		var page = jQuery.parseHTML(data);
		var links = $(page).find(".inlist_object h3 a").map(function(){return this.href});
		$(links).each(handleAd);
	});
}