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

function includeScript(scriptLocation)
{
	var embeddedCode = document.createElement("script");
	embeddedCode.src = scriptLocation;
	embeddedCode.type="text/javascript";
	(document.head || document.documentElement).appendChild(embeddedCode);
}

function includeStyle(styleLocation)
{
	var embeddedStyle = document.createElement("link");
	embeddedStyle.rel = "stylesheet";
	embeddedStyle.type = "text/css";
	embeddedStyle.href =  styleLocation;
	(document.head || document.documentElement).appendChild(embeddedStyle);
}

var isMapPage = window.location.href.lastIndexOf("http://snimaemsami.ru/map") === 0;
var isObjectsPage = window.location.href.lastIndexOf("http://snimaemsami.ru/objects") === 0;

var mapMenuItemLink = document.createElement("a");

var objectsRequest = "";
if (isMapPage || isObjectsPage)
{
	var requestStarts = window.location.href.lastIndexOf("?");
	if (requestStarts > 0)
	{
		objectsRequest = clarifyParamsString(window.location.href.substring(requestStarts+1));
	}
}

if (objectsRequest.length > 0)
{
	mapMenuItemLink.href = "/map?" + objectsRequest;
}
else
{
	mapMenuItemLink.href = "/map";
}

mapMenuItemLink.innerText = "Объявления на карте";
if (isMapPage)
{
	mapMenuItemLink.className = "active"
}

var mapMenuItem = document.createElement("li");
mapMenuItem.appendChild(mapMenuItemLink)

document.getElementById("menu").appendChild(mapMenuItem);

if (isMapPage)
{
	includeStyle(chrome.extension.getURL("/mappagestyle.css"));

	var middleContainer = document.getElementById("middle");
	middleContainer.innerHTML = "";
	document.title = "Объявления на карте";

	jQuery.get(chrome.extension.getURL('/mappagecontent.html'), function(data) {
		var mappagecontent = $.parseHTML(data);
		var backLink = $(mappagecontent).find("#object-list-link");
		backLink.attr("href", "/objects?" + objectsRequest);
		$(mappagecontent).appendTo("#middle");

		pageNumber = $.query.get("pageNumber");
		if (!pageNumber)
		{
			pageNumber = 5;
		}
		$(mappagecontent).find("#pageNumberNumerator").val(pageNumber);
		$(mappagecontent).find("#total-ad-count").text(pageNumber*15);

		includeScript(chrome.extension.getURL("/jquery.query-object.js"));
		includeScript(chrome.extension.getURL("/embedded-code.js"));
	});
}