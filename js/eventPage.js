//FIRES FOR TAB REFRESH
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var currentTab = new Object;
    currentTab.id = tabId;
    if (changeInfo.status == "loading") {
        if (changeInfo.url == undefined) {
            currentTab.url = tab.url;
        } else {
            currentTab.url = changeInfo.url;
        }
        currentTab.scheme = currentTab.url.substring(0,7);
        currentTab.postScheme = currentTab.url.split('//')[1];
        if (currentTab.scheme == "https:/") {
            chrome.browserAction.setIcon({ path: '/img/icon_green.gif' });
            chrome.storage.local.get({'tabs': []}, function(stored) {
            	//REMOVE OLD INDEX FOR TAB RE: BACK FEATURE
            	for (var i=0; i<stored.tabs.length; i++) {
            		if (stored.tabs[i].id == currentTab.id) {
            			stored.tabs.splice(stored.tabs[i],1);
            		}
            	}
            	stored.tabs.push(currentTab);
            	chrome.storage.local.set({'tabs': stored.tabs});
            });
        } else {
        	chrome.browserAction.setIcon({ path: '/img/icon_red.png' });
        	chrome.storage.local.get({'tabs': []}, function(stored) {
        		for (var i=0; i<stored.tabs.length; i++) {
        			if (stored.tabs[i].id == currentTab.id) {
        				//GO BACK TWICE IF HIT 'BACK' BUTTON ON PAGE
        				//THAT WAS JUST REDIRECTED BY tooSaftey
        				if (stored.tabs[i].scheme == 'https:/' && stored.tabs[i].postScheme == currentTab.postScheme) {
        					chrome.tabs.executeScript(null,{code:"history.back()"});
        					var matched = true;
        					break;
        				}
        			}
        			var matched = false;
        		}
            	if (matched == false) {
            		var secureUrl = currentTab.url.replace(currentTab.scheme, 'https://');
            		if (isActiveLink(secureUrl)) {
            			//FINALLY REDIRECT
            			redirectTab(secureUrl);
            			showNotification('redirect');
            			stored.tabs.push(currentTab);
            			chrome.storage.local.set({'tabs': stored.tabs});
            		}
            	}
            });
        }
    }
});

//FIRES WHEN CHANGE TABS && WHEN TYPE URL IN NEW BLANK TAB
chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        var currentUrl = tab.url;
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
})

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
