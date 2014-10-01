function isActiveLink(link) {
    var status = false;
    $.ajax({
        url: link,
        statusCode: {
            200: function() {
                status = true;
            }
        },
        async: false
    });
    return status;
}

function redirectTab(redirectUrl) {
    chrome.tabs.update({ url: redirectUrl});
    chrome.browserAction.setIcon({ path: '/img/icon_green.gif' });
}

function showNotification(id) {
    var options = {
        type: 'basic',
        iconUrl: '../img/icon_default.png',
        title: 'TooSaftey',
        message: 'redirecting through secure https...',
    }
    chrome.notifications.create(
        id,
        options,
        function(notificationID) {
            //HIDE NOTIFICATION AFTER 2 SECONDS
            chrome.alarms.create(
                id,
                {delayInMinutes:0.02}
            );
        }
    );
    //CLEAR NOTIFICATION SO WILL FIRE AGAIN WITHOUT HAVING TO CHECK
    clearNotification(id);
}

function clearNotification(id) {
    chrome.notifications.clear(
        id, 
        function(wasCleared) {
    });
}

function httpPopUp() {
    $("#currentUrl").html('unencrypted connection');
    $("#currentUrl").css("color", "red");
    $(".bodyBox").css('background-color', '#E0EEEE');
    $(".textBox").css('background-color', '#E0EEEE');
}

function httpsPopUp() {
    $("#currentUrl").html('encrypted https connection');
    $("#currentUrl").css('color', '#7FFFD4');
    $(".bodyBox").css('background-color', '#FFF8DC');
    $(".textBox").css('background-color', '#FFF8DC');
}
