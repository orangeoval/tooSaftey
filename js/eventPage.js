/*
* Copyright 2015 Philip Ardery
*
* This file is part of the tooSaftey Google Chrome plugin.
*
* tooSaftey is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* tooSaftey is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with tooSaftey.  If not, see <http://www.gnu.org/licenses/>.
*/

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
