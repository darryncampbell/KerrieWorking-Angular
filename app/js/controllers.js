'use strict';

/* Controllers */

var kerrieWorkingControllers = angular.module('kerrieWorkingControllers', []);

var kerrieId = 9747;
var thirtyMinuteTreatmentId = 31148;

kerrieWorkingControllers.controller('DayDetailCtrl', ['$rootScope', '$scope', '$stateParams',
  function($rootScope, $scope, $stateParams) {
	$scope.theDay = $stateParams.theDay;
    $scope.orderProp = 'age';
	
	$scope.refreshData = function()
	{
		refreshData($rootScope, $scope);
	}
	
    if ($rootScope.g_guid == undefined)
    {
      $rootScope.g_guid = "";
    }
    //  $stateParams.theDay holds the day we are being asked to fetch 
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var ordinal = "th";
    var theDay = new Date($stateParams.theDay);
    if (theDay.getDate() == 1 || theDay.getDate() == 21 || theDay.getDate() == 31)
      ordinal = "st";
    else if (theDay.getDate() == 2 || theDay.getDate() == 22)
      ordinal = "nd";
	  var weekday = new Array(7);
		weekday[0]=  "Sunday";
		weekday[1] = "Monday";
		weekday[2] = "Tuesday";
		weekday[3] = "Wednesday";
		weekday[4] = "Thursday";
		weekday[5] = "Friday";
		weekday[6] = "Saturday";
    var formattedDate = weekday[theDay.getDay()] + ", " + theDay.getDate() + ordinal + " " + months[theDay.getMonth()] + " " + theDay.getFullYear();
    $scope.formattedDate = formattedDate;
    
//    $rootScope.g_guid = getGuid($rootScope);
//    getTodaysBookings($rootScope, $rootScope.g_guid, null);
    pageLoad($rootScope, $scope);
    
  }]);

kerrieWorkingControllers.controller('DayListCtrl', ['$scope',
  function($scope) {
      var dateArray = [new Date(), new Date(), new Date(), new Date(), new Date(), new Date(), new Date(), new Date(), new Date(), new Date()]
      var d = new Date();
      for (var i = 0; i < 10; i++)
      {
        dateArray[i].setDate(dateArray[i].getDate() + i);
      }
      $scope.dates = dateArray;
  }]);


function ajaxRequest($rootScope, $scope, guid, url, method, parameters, async, functionToCall, parseDaysAhead)
{
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var response = xmlhttp.responseText;
			//console.log(response);
			//document.getElementById('output').innerHTML = response;
			if (guid == "init")
			{
				//  Need to obtain the Guid from the response
  			if (window.DOMParser)
			  {
  			  var parser=new DOMParser();
  			  var xmlDoc=parser.parseFromString(response,"text/html");
			  }
//			else // code for IE
//			  {
//			  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
//			  xmlDoc.async=false;
//			  xmlDoc.loadXML(response);
//			  }
			  var guidNode = xmlDoc.getElementById('OnlineBookingGuid');
			  console.log(guidNode.value);
			  if (guidNode != null)
        {
  				$rootScope.g_guid = guidNode.value;
  				guid = $rootScope.g_guid;
			  }
			}
			if (functionToCall != undefined)
        		functionToCall($rootScope, $scope, guid, response, parseDaysAhead);
		}
	}
	xmlhttp.open(method, url, async);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send(parameters);
	return "";
}

function getGuid($rootScope, $scope)
{
	var url  = "http://book.gettimely.com/Booking/Location/bodyimagebeautysalons";
	var guid = "init";
	ajaxRequest($rootScope, $scope, guid, url, "GET", "", true, postSalon);
}

function postSalon($rootScope, $scope, guid)
{
	var url  = "http://book.gettimely.com/Booking/Location/bodyimagebeautysalons";
	ajaxRequest($rootScope, $scope, guid, url, "POST", "ResellerCode=&OnlineBookingGuid=" + guid + "&LocationId=5875", true, request30MinuteTreatment)
}

function request30MinuteTreatment($rootScope, $scope, guid)
{
	var url  = "http://book.gettimely.com/Booking/Service?obg=" + guid;
	ajaxRequest($rootScope, $scope, guid, url, "POST", "OnlineBookingMultiServiceEnabled=True&LocationId=0&ServiceIds=" + thirtyMinuteTreatmentId, true, getAvailableDatesForTreatment);
}

function getAvailableDatesForTreatment($rootScope, $scope, guid)
{
	var theMonth = new Date().getMonth() + 1;
	var theYear = new Date().getFullYear();
	var url  = "http://book.gettimely.com/Booking/GetOpenDates?obg=" + guid + "&month=" + theMonth + "&year=" + theYear + "&staffId=" + kerrieId;
	ajaxRequest($rootScope, $scope, guid, url, "GET", "", true, getTodaysBookings)
}

function getTodaysBookings($rootScope, $scope, guid, availableSlots)
{
	//var d = new Date(new Date().getTime());
	var d = new Date($scope.theDay);
	var theDay   = ("00" + d.getDate()).slice(-2);
	var theMonth = ("00" + (d.getMonth()+1)).slice(-2);
	var theYear = d.getFullYear();
	console.log(theDay + "/" + theMonth + "/" + theYear);
	var url  = "http://book.gettimely.com/booking/gettimeslots/?obg=" + guid + "&dateSelected=" + theYear + "-" + theMonth + "-" + theDay + "&staffId=" + kerrieId + "&tzName=Europe/London&tzId=";
	ajaxRequest($rootScope, $scope, guid, url, "GET", "", true, parseResponse, 0)
}

function getNextSevenDaysBookings($rootScope, $scope, guid)
{
	var daysAhead = 1;
	while (daysAhead <= 8)
	{
		var d = new Date(new Date().getTime() + (daysAhead * 24 * 60 * 60 * 1000));
		var theDay   = ("00" + d.getDate()).slice(-2);
		var theMonth = ("00" + (d.getMonth()+1)).slice(-2);
		var theYear = d.getFullYear();
		console.log(theDay + "/" + theMonth + "/" + theYear);
		var url  = "http://book.gettimely.com/booking/gettimeslots/?obg=" + guid + "&dateSelected=" + theYear + "-" + theMonth + "-" + theDay + "&staffId=" + kerrieId + "&tzName=Europe/London&tzId=";
		ajaxRequest($rootScope, $scope, guid, url, "GET", "", true, parseResponse, daysAhead)
		daysAhead++;
	}
}

function parseResponse($rootScope, $scope, guid, response, parseDaysAhead)
{
if (window.DOMParser)
  {
  var parser=new DOMParser();
  var xmlDoc=parser.parseFromString(response,"text/html");
  }
//else // code for IE
//  {
//  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
//  xmlDoc.async=false;
//  xmlDoc.loadXML(response);
//  }

  if (response.indexOf("Session timeout") > -1)
  {
	//  Session has timed out, re-establish it:
	$rootScope.g_guid = "";
	pageLoad($rootScope, $scope);
  }
  else
  {
  if (parseDaysAhead == 0)
//	getNextSevenDaysBookings($rootScope.g_guid);

	console.log(response);

	// Write the date heading
	var dayHeading = xmlDoc.getElementsByTagName("h3");
	var dayHeadingAsString = dayHeading[0].innerHTML;
	var actualDate = dayHeadingAsString.indexOf("Times available on ");
	console.log(actualDate);
	if (actualDate > -1)
	{
		dayHeadingAsString = dayHeadingAsString.substring("Times available on ".length, dayHeadingAsString.length);
	}

//	document.getElementById("day" + parseDaysAhead + "Heading").innerHTML = "<H2>" + dayHeadingAsString + " slots free:</H2>";

	//  Write the available times
  var freeTimes = customerNode = xmlDoc.getElementsByTagName ("label").length;
  var timeList;
  $scope.freeTimes = [];
  $scope.$apply();
	if (freeTimes == 0)
	{
		console.log("No Times Available");
		timeList = "<H3>No times available</H3>";
		$scope.message = "No times available";
	}
	else
		timeList = "<UL class='list-group'>"
  for (var i = 0; i < freeTimes; i++)
  {
	  var customerNode = xmlDoc.getElementsByTagName ("label")[i];
	  var nodeText = customerNode.innerHTML;
    console.log("DCC DEBUG: " + nodeText);
	  var n = nodeText.indexOf("<");
    var time = nodeText.substring(0, n);
	//  alert(customerNode.innerHTML);
		time = time.replace(/\r?\n|\r/g,"").trim();
		$scope.freeTimes.push(time);
		time = "<LI class='list-group-item'>" + time + "</LI>";
		console.log(time);
		timeList += time;
//		if (timeList == "")
//			timeList = time;
//		else
//			timeList = timeList + ", " + time;
	//	alert(time);
	}
	if (freeTimes > 0)
		timeList += "</UL>";
	if ($scope.freeTimes.length != 0)
		$scope.message = "The following times are available:";
	$scope.$apply();
	//alert($scope.freeTimes);
//	document.getElementById("day" + parseDaysAhead + "Content").innerHTML = timeList;
	stopSpinning();

}
}

function pageLoad($rootScope, $scope)
{
	setSpinning();
	if ($rootScope.g_guid == "" || $rootScope.g_guid == undefined)
		$rootScope.g_guid = getGuid($rootScope, $scope);
	else
		refreshData($rootScope, $scope);
}

function refreshData($rootScope, $scope)
{
	//  First just try and populate the sessions but if that has timed out then
	//  re-establish the session
	if ($rootScope.g_guid != "")
	{
		setSpinning();
		getTodaysBookings($rootScope, $scope, $rootScope.g_guid, null);
	}
	else
	{
		pageLoad($rootScope, $scope);
	}

}

