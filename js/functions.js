function isActiveLink(link) {
    var status = false;
    $.ajax({
        url: link,
        statusCode: {
            200: function() {
                status = true;
            }
        },
        async: false
    });
    return status;
}

function redirectTab(redirectUrl) {
    chrome.tabs.update({ url: redirectUrl});
    chrome.browserAction.setIcon({ path: '/img/icon_green.gif' });
}

function showNotification(id) {
	chrome.storage.local.get('tcount', function(result) {
		//Check redirect count, increment, and save
		if (result.tcount == undefined) {
			var totalRedirectCount = 1;
		} else {
			result.tcount++;
			var totalRedirectCount = result.tcount;
		}
		chrome.storage.local.set({'tcount': totalRedirectCount});
		//Create notification
		var text = "redirecting through secure https\n";
		var count = "total redirects: " + totalRedirectCount;
		var options = {
        	type: 'basic',
        	iconUrl: '../img/icon_default.png',
        	title: 'TooSaftey',
        	message: text + count,
    	}
    	chrome.notifications.create(
        	id,
        	options,
        	function(notificationID) {
            	//Hide notification after 2 seconds
            	chrome.alarms.create(
                	id,
                	{delayInMinutes:0.02}
            	);
        	}
    	);
	});
    clearNotification(id);
}

function clearNotification(id) {
    chrome.notifications.clear(
        id,
        function(wasCleared) {
    });
}

function httpPopUp(count) {
    $("#currentUrl").html('unencrypted connection');
    $("#totalRedirectCount").html('redirects to date: ' + count);
    $(".bodyBox").css('background-color', '#E0EEEE');
    $(".textBox").css('background-color', '#E0EEEE');
    $(".textBox").css('color', "red");
}

function httpsPopUp(count) {
    $("#currentUrl").html('encrypted https connection');
    $("#totalRedirectCount").html('redirects to date: ' + count);
    $(".bodyBox").css('background-color', '#FFF8DC');
    $(".textBox").css('background-color', '#FFF8DC');
    $(".textBox").css('color', '#00F90E');
}
