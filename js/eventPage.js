// Fires when refresh tab
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "loading") {
        if (changeInfo.url == undefined) {
            var current = new Tabject(tabId, tab.url);
        } else {
            var current = new Tabject(tabId, changeInfo.url);
        }
        validateTabRedirect(current);
    }
});

// Fires when change tab & when type url in new blank tab
chrome.tabs.onActivated.addListener(function(activeInfo) {
    if (activeInfo != undefined) {
        chrome.tabs.get(activeInfo.tabId, function(tab) {
            if (tab != undefined) {
            	var current = new Tabject(tab.id, tab.url);
       	    	validateTabRedirect(current);
            }
        });
    }
});

// Check for signal that the alarm has gone off
chrome.alarms.onAlarm.addListener(function(alarm) {

    // Clear notice
    chrome.notifications.update(
        alarm.name,
        {priority: -1},
        function() {}
    );

    // Clear Alarm
    chrome.alarms.clear(
        alarm.name,
        function(wasCleared) {}
    );
});
