$(document).ready(function() {

    // Inherit default settings
    inheritDefaults();

    // Detect checkbox in popup
    $('input[name=showNotices]').change(function() {

        if ($(this).is(':checked')) {
            // Checked
            chrome.storage.local.set({'show_notices': true});
        } else {
            // Unchecked
            chrome.storage.local.set({'show_notices': false});
        }    

    });

    var excludebutton = $('a#exclude_button');
    var showexcludelist = $('#exclusion_list_button');
    var list = $('div.exclude_list');
    var items = '';
    var query = {active: true, currentWindow: true};

    chrome.tabs.query(query, function(tabs) {

        var current = new Tabject(tabs[0].id, tabs[0].url);

        chrome.storage.local.get(['tcount', 'exclusions'], function(result) {

            if (result.tcount == undefined) {
                var count = 0;
            } else {
                var count = result.tcount;
            }

            if (result.exclusions == undefined) {
                exclusion_list = new Array;
            } else {
                exclusion_list = result.exclusions.sort();
            }

            // Determine which popup notification
            if (current.scheme != 'https:') {
                httpPopUp(count, current.id);
            } else {
                httpsPopUp(count, current.id);
            }

            // Check if current tab host is already excluded
            if (exclusion_list.indexOf(current.host) === -1) {
                can_exclude = true;
            } else {
                can_exclude = false;
                excludebutton.html('<i>[host excluded]</i>');
            }

            // Add Exclusion button pressed
            excludebutton.click(function() {

                if (can_exclude) {
                    chrome.browserAction.setIcon({ path: '/img/icon_exclude.gif' });
                    exclusion_list.push(current.host);
                    exclusion_list.sort();
                    chrome.storage.local.set({'exclusions': exclusion_list});
                    excludebutton.html('<i>[host excluded]</i>');
                    can_exclude = false;
    
                    // Redirect back to http
                    //alert("BLAH: " + current.http_url);
                    command = 'window.location.replace("' + current.http_url + '")';
                    chrome.tabs.executeScript(current.id,{code: command}, function(result) {});

                    return false;
                }

            });

            // Show Exclusion List button pressed
            showexcludelist.click(function() {

                var action = showexcludelist.attr('action');

                if (action == 'show') {

                    showexcludelist.html("hide exclusion list");
                    showexcludelist.attr('action', 'hide');

                    if (exclusion_list.length === 0) {
                        items = '<i>(none)</i><br>';
                    } else {
                        for (var i=0; i<exclusion_list.length; i++) {
                            items += '<i>' + exclusion_list[i] + '</i><br>';
                        }
                    }

                    list.html(items).css('border', '1px solid');
                    items = '';
                    list.show();
                    return false;

                } else {

                    showexcludelist.html("show exclusion list");
                    showexcludelist.attr('action', 'show');
                    list.hide();
                    return false;

                }
            });
        });
    });
});
