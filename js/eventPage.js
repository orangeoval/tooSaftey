$(document).ready(function() {
    //FIRES FOR TAB REFRESH
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.status == "loading") {
            if (changeInfo.url == undefined) { 
                currentUrl = tab.url;
            } else {
                currentUrl = changeInfo.url;
            }
            var scheme = currentUrl.substring(0,7);
            if (scheme == "https:/") {
                chrome.browserAction.setIcon({ path: '/img/icon_green.gif' });
            } else {
                chrome.browserAction.setIcon({ path: '/img/icon_red.png' });
                var secureUrl = currentUrl.replace(scheme, 'https://');
                if (isActiveLink(secureUrl)) {
                    redirectTab(secureUrl);
                    showNotification('redirect');
                }
            }
        }
    });

    //FIRES WHEN CHANGE TABS && WHEN TYPE URL IN NEW BLANK TAB
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        chrome.tabs.get(activeInfo.tabId, function(tab) {
            currentUrl = tab.url;
            var scheme = currentUrl.substring(0,7);
            if (scheme == "https:/") {
                chrome.browserAction.setIcon({ path: '/img/icon_green.gif' });
            } else {
                var secureUrl = currentUrl.replace(scheme, 'https://');
                if (isActiveLink(secureUrl)) {
                    redirectTab(secureUrl);
                    showNotification('redirect');
                } else {
                    chrome.browserAction.setIcon({ path: '/img/icon_red.png' });
                }
            }
        });
    });

    //CHECK FOR SIGNAL THAT THE ALARM HAS GONE OFF
    chrome.alarms.onAlarm.addListener(function(alarm) {
	//CLEAR NOTICE
        chrome.notifications.update(
            alarm.name, 
            {priority: -1}, 
            function() {
        });
        //CLEAR ALARM
        chrome.alarms.clear(
            alarm.name, 
            function(wasCleared) {
        });
    });
});
