//FIRES FOR TAB REFRESH
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "loading") {
        var current = new Object;
        if (changeInfo.url == undefined) {
            var current = new Tabject(tabId, tab.url);
        } else {
            var current = new Tabject(tabId, changeInfo.url);
        }
        validateTabRedirect(current);
    }
});

//FIRES WHEN CHANGE TABS && WHEN TYPE URL IN NEW BLANK TAB
chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        var current = new Tabject(tab.id, tab.url);
        validateTabRedirect(current);
    });
});

//CHECK FOR SIGNAL THAT THE ALARM HAS GONE OFF
chrome.alarms.onAlarm.addListener(function(alarm) {
    //CLEAR NOTICE
    chrome.notifications.update(
        alarm.name,
        {priority: -1},
        function() {}
    );
    //CLEAR ALARM
    chrome.alarms.clear(
        alarm.name,
        function(wasCleared) {}
    );
});
