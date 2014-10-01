$(document).ready(function() {
    chrome.tabs.getSelected(null,function(tab) {
        var scheme = tab.url.split('://')[0];
        if (scheme == 'http' || scheme == 'chrome') {
            httpPopUp();
        } else {
            httpsPopUp();
        }
    });
});
