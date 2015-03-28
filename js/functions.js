function Tabject(id, url) {
    this.id = id;
    this.scheme = url.split('/')[0];
    this.host = url.split('/')[2];
    this.secureUrl = url.replace(this.scheme, 'https:');
}


function validateTabRedirect(tab) {
    chrome.storage.local.get(['redirects', 'exclusions'], function(result) {

        if (result.redirects == undefined) {
            redirects = new Array();
        } else {
            redirects = result.redirects;
        }

        if (result.exclusions == undefined) {
            exclusions = new Array();
        } else {
            exclusions = result.exclusions;
        }

        if (exclusions.indexOf(tab.host) !== -1) {

            // Has been excluded
            chrome.browserAction.setIcon({ path: '/img/icon_exclude.gif' });

        } else if (tab.scheme == 'https:') {

            // Valid https
            chrome.browserAction.setIcon({ path: '/img/icon_green.gif' });
            delete redirects[tab.id];
            chrome.storage.local.set({'redirects': redirects});

        } else {

            chrome.browserAction.setIcon({ path: '/img/icon_red.png' });
            if (redirects[tab.id] != tab.host) {
                checkHttps(tab, redirects);
            } else {

                // Http -> https -> http loop detected
                chrome.browserAction.setIcon({ path: '/img/icon_red.png' });
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

                // Keep track of redirect to avoid https -> http loop
                redirects[tab.id] = tab.host;
                chrome.storage.local.set({'redirects': redirects});
                redirectTabThroughHttps(tab.secureUrl, tab.id);
            }
        }
    });
}


function redirectTabThroughHttps(redirectUrl, tabId) {
    chrome.tabs.get(tabId, function(tab) {

        // Redirect tab only if still on same url
        if (tab.url == redirectUrl.replace('https:', 'http:')) {

            var command = 'window.location.replace("' + redirectUrl + '")';

            chrome.tabs.executeScript(tabId,{code: command}, function(result) {
                chrome.browserAction.setIcon({ path: '/img/icon_green.gif' });
                showNotification('redirect');
            });
        }
    });
}


function showNotification(id) {
    chrome.storage.local.get(['tcount','show_notices'], function(result) {

        // Only continue if 'Show notices' checkbox in popup is checked
        if (result.show_notices) {

            // Get redirect count, increment if appropriate
            if (result.tcount == undefined) {
                var totalRedirectCount = 1;
            } else {

                if (id == 'redirect') {
                    result.tcount++;
                }

                var totalRedirectCount = result.tcount;
            }

            chrome.storage.local.set({'tcount': totalRedirectCount});

            // Create notification
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

                    // Hide notification after 2 seconds
                    chrome.alarms.create(
                        id,
                        {delayInMinutes: 0.02}
                    );
                }
            );

            clearNotification(id);
        }
    });
}


function clearNotification(id) {
    chrome.notifications.clear(
        id,
        function(wasCleared) {}
    );
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


function inheritDefaults() {
    chrome.storage.local.get(['show_notices'], function(result) {
        if (result.show_notices) {
            $('input[name=showNotices]').prop('checked', true);
        }
    });
}
