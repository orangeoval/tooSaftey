function Tabject(id, url) {
	this.id = id;
	this.scheme = url.split('/')[0];
	this.host = url.split('/')[2];
	this.secureUrl = url.replace(this.scheme, 'https:');
}

function validateTabRedirect(tab) {
	chrome.storage.local.get(['redirects', 'exclusions'], function(result) {
		if (result.exclusions != undefined && result.exclusions.indexOf(tab.host) !== -1) {
			//HAS BEEN EXCLUDED
			chrome.browserAction.setIcon({ path: '/img/icon_exclude.gif' });
		} else if (tab.scheme == 'https:') {
			//VALID HTTPS
			chrome.browserAction.setIcon({ path: '/img/icon_green.gif' });
			delete result.redirects[tab.id];
			chrome.storage.local.set({'redirects': result.redirects});
		} else {
			chrome.browserAction.setIcon({ path: '/img/icon_red.png' });
			if (result.redirects == undefined || result.redirects[tab.id] != tab.host) {
				checkHttps(tab, result.redirects);
			} else {
				//LOOP
				chrome.browserAction.setIcon({ path: '/img/icon_default.png' });
				showNotification('loop');
			}
		}
	});
}

function checkHttps(tab, redirects) {
	$.ajax({
        url: tab.secureUrl,
        statusCode: {
            200: function() {
				if (redirects == undefined) {
					redirects = new Array();
				}
				//KEEP TRACK OF REDIRECT TO AVOID HTTPS->HTTP LOOP
				redirects[tab.id] = tab.host;
				chrome.storage.local.set({'redirects': redirects});
				redirectTabThroughHttps(tab.secureUrl, tab.id);
				showNotification('redirect');
            }
        }
        /*DEBUG BAG PROBLEMATIC URLS
        error: function(jqXHR, exception) {
            if (jqXHR.status === 0) {
                alert('Not connect.\n Verify Network. [tab:' + tabId + ']');
            } else if (jqXHR.status == 404) {
                alert('Requested page not found. [404] [tab:' + tabId + ']');
            } else if (jqXHR.status == 500) {
                alert('Internal Server Error [500] [tab:' + tabId + ']');
            } else if (exception === 'parsererror [tab:' + tabId + ']') {
                alert('Requested JSON parse failed [tab:' + tabId + ']');
            } else if (exception === 'timeout [tab:' + tabId + ']') {
                alert('Time out error.');
            } else if (exception === 'abort [tab:' + tabId + ']') {
                alert('Ajax request aborted. [tab:' + tabId + ']');
            } else {
                alert('Uncaught Error. [tab:' + tabId + ']\n' + jqXHR.responseText);
            }
        }
        */
    });
}

function redirectTabThroughHttps(redirectUrl, tabId) {
	var command = 'window.location.replace("' + redirectUrl + '")';
	chrome.tabs.executeScript(tabId,{code: command});
	chrome.browserAction.setIcon({ path: '/img/icon_green.gif' });
}

function showNotification(id) {
	chrome.storage.local.get('tcount', function(result) {
		//Get redirect count, increment if appropriate
		if (result.tcount == undefined) {
			var totalRedirectCount = 1;
		} else {
			if (id == 'redirect') {
				result.tcount++;
			}
			var totalRedirectCount = result.tcount;
		}
		chrome.storage.local.set({'tcount': totalRedirectCount});
		//Create notification
		if (id == 'redirect') {
			var text = 'redirecting through secure https';
			var icon = '../img/icon_redirect.png';
		} else if (id == 'loop') {
			var text = 'loop detected, staying on http';
			var icon = '../img/icon_loop.png';
		}
		var count = "\ntotal redirects: " + totalRedirectCount;
		var options = {
			type: 'basic',
			iconUrl: icon,
			title: 'tooSaftey',
			message: text + count,
		};
		chrome.notifications.create(
			id,
			options,
			function(notificationID) {
				//Hide notification after 2 seconds
				chrome.alarms.create(
					id,
					{delayInMinutes: 0.02}
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

function httpPopUp(count, tabId) {
    $('#status').html('unencrypted connection').addClass('http');
    $('#tabid').html(tabId);
    $('#count').html(count);

}

function httpsPopUp(count, tabId) {
    $('#status').html('encrypted https connection').addClass('https');
    $('#tabid').html(tabId);
    $('#count').html(count);
}
