$(document).ready(function() {
    chrome.tabs.getSelected(null,function(tab) {
        var scheme = tab.url.split('://')[0];
        if (scheme == 'http' || scheme == 'chrome') {
        	chrome.storage.local.get('tcount', function(result) {
            	var count = result.tcount;
            	httpPopUp(count);
            });
        } else {
        	chrome.storage.local.get('tcount', function(result) {
            	var count = result.tcount;
            	httpsPopUp(count);
            });
        }
    });
});
