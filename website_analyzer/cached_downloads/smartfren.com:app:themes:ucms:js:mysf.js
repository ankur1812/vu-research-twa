var COOKIE_SESSION_ID = "mysf_session_id";
var COOKIE_SESSION_CREATED = "mysf_session_created";
var notificationData = "notificationData";
var flutterAppUri = document.getElementById("flutter-url").getAttribute('content');
var flutterAppMainUri = document.getElementById("flutter-main-url").getAttribute('content');
var isFlutterActive = document.getElementById("is-flutter-active").getAttribute('content');
var proxyApiUri = document.getElementById("proxy-api-url").getAttribute('content');
var isLoggedIn = false;

// get cookie
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
// set cookie
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// hit BE API
function checkSession(onSuccess){
    var sessionId = getCookie(COOKIE_SESSION_ID);
    if(sessionId){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(this.responseText);
                onSuccess(response.result.status == 0);
            }
        };
        xhttp.open("POST", proxyApiUri + "/proxy/CUSTINFO_URI", true);
        xhttp.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhttp.setRequestHeader('Accept-Language', 'id');
        xhttp.send(JSON.stringify({
            "method": "getSubInfoDetail",
            "params": [
                sessionId,
            ]
        }));
    }
    else{
        onSuccess(false);
    }
}
function renderFormtopup(mdn,topup){
    jQuery('<form action="/payments" method="POSt"><input type="hidden" name="mdn_no" value="'+mdn+'"><input type="hidden" name="amount" value="'+topup+'"> </form>').appendTo('body').submit();
}

var i = 0;
// render login button
function renderLoginButton(){

    var button = document.getElementsByClassName('mysfLoginButton');
    var lng = jQuery('#id').hasClass('active') ? 'id' : 'en';
    // check session
    checkSession((isValid) => {
        sessionChanged(isValid);
        for (let item of button) {
            if(isValid){
                // if valid --> logout button
                item.innerHTML = 'Logout';
                if(lng == 'en'){
                    item.innerHTML = '<i class="fa fa-sign-out-alt" aria-hidden="true"></i> Logout';
                }else{
                    item.innerHTML = '<i class="fa fa-sign-out-alt" aria-hidden="true"></i> Keluar';
                }
                item.href = 'javascript:logout();';
                jQuery(".not-login").css("display", "none");
                jQuery(".logged-in").css("display", "block");
                
                if(jQuery(window).width() < 768 && i == 0) {
                    jQuery(".home-panel-iframe").clone().appendTo(".panel-grid:first");
                    jQuery(".home-panel-iframe:first").remove();
                    i = 1;
                }
            }
            else{
                document.cookie = notificationData +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                document.cookie = COOKIE_SESSION_ID +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                document.cookie = COOKIE_SESSION_CREATED +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                // if not --> login button
                var webUrl = '/login/';
                if(lng == 'en'){
                    webUrl = '/en/login/';
                    item.innerHTML = '<i class="fa fa-sign-in-alt" aria-hidden="true"></i> Login / Sign Up';
                }else{
                    item.innerHTML = '<i class="fa fa-sign-in-alt" aria-hidden="true"></i> Masuk / Daftar';
                }
                item.href = webUrl;
                item.style.color = "#ff1659";
                jQuery(".login-mobile .mysfLoginButton").css("cssText", "border-color: #ff1659 !important; color: #ff1659;");
                jQuery(".logged-in").css("display", "none");
                jQuery(".not-login").css("display", "flex");
            }
        }
    });
//}
}
renderLoginButton();

// render notification bar
function renderNotificationBar(){
    var getNotificationData = getCookie(notificationData);
    //var notificationDiv = document.getElementsByClassName('notification-message');
    if(getNotificationData){
        jQuery(".notification-bar").css("display", "block");
        //notificationDiv.innerHTML = getNotificationData;
        jQuery('.notification-message').text(getNotificationData);

    }
    else{
        jQuery(".notification-bar").css("display", "none");
    }
        
}

renderNotificationBar();

function addCss() {
    var loadingIndicatorCss = '#progressModal{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;top:0;left:0;bottom:0;right:0}#progressModal .pm-content{position:absolute;top:50%;left:50%;width:200px;height:200px;margin-left:-100px;margin-top:-100px;background:#fff;text-align:center}#progressModal .pm-content::before{content:"";height:100%;width:0;display:inline-block;vertical-align:middle}#progressModal .pm-content>div{display:inline-block;text-align:center;max-width:90%;vertical-align:middle}#progressModal .pm-content>div>span{display:block;margin-bottom:20px;font-family:TruenoLt;font-size: var(--sf-twelve);font-weight:300}.lds-ring{display:inline-block;position:relative;width:32px;height:32px}.lds-ring div{box-sizing:border-box;display:block;position:absolute;width:32px;height:32px;border:5px solid #ff1659;border-radius:50%;animation:lds-ring 1.2s cubic-bezier(.5,0,.5,1) infinite;border-color:#ff1659 transparent transparent transparent}.lds-ring div:nth-child(1){animation-delay:-.45s}.lds-ring div:nth-child(2){animation-delay:-.3s}.lds-ring div:nth-child(3){animation-delay:-.15s}@keyframes lds-ring{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}';
    var styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = loadingIndicatorCss;
    document.head.appendChild(styleSheet);
}
addCss();

function showModal(
    isSuccess,
    message
) {
    hideModal();
    var tickImage = 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAARISURBVHgB7d2/ctNYFMfxIzvLbplHSE/DvkHS7wY8u/FmaTAdHeYJCE8QeAJMBePAKAR6QkcHFPR5hNDCxOIeGWeAOEFX90i6Et9PwYQ/A0x+ufLVPT85IgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiUCJqVXluVld9SSZKJ/DV9JMYIuEnzcF9JllzJf96TkXXIPUEz0u016V96exqumslEXgzviqG+oH55uLNX7qO1Jb+7Ltcvizz+8FoMEHDdLg53wSxkAq5TsXAXTEJmk1WXdOuK9JNUioX7rfuyOb0jJa0IqjcPV1fuqnjL3ksAdtFVS7fXS4Z7LCezDdncm0gAXoOr9HJ4Q5Js3330h/hx4WYbMnj6RgKxgqui4ep9rb+jebh778QAAVdBDytKh/vJLFzFLtqahpvJjvj7Gu7+kRgiYEuRhasI2EqE4SoCtnAw3HU/jsVXlr2T2WcN91gqQsChDv576JIaia8awlWcZJWls9z+77vlwpVHLtxx1eEqVnAZPw7qfWi4V6cjqQn3wb6Cws0e1BmuImAfy1oYRWVyT67u+W/EAnGJLspvlvu9PNzpjjSAgItoabiKgH+mxeEqAr5I+RaGk90MneVaIODzhLUwoghXsYtepuEWhiUaHT+KoIVhiRX8rUhaGJYIeCGiFoYlNlkq0lmuhWpWsG5S5jPS+HU4XGUfsL6OzQ8GxnKw9VBi1vFwle0letkmpabBtreIWxiW7FbweZuUxE1eem68pmO2WOQtjO6Hq2xWcLFLXfOXteAWxqdxm8JV4QH7vY41F3KLWhiWwi7R/psUHZjr5XpN6tSyFoalsICz2UfxV2/ILWxhWAq/RKdbI3cwX+Z2SI/3BpWeALV8lmvBZpOV/nNN+n0NucT0paIzXMLN2dwmDZ7t50FpYH5W87GcfoFYItxTtgcdOiTvJan7W9fEl9WbgHWghWHJftigq6fnVk+ZkEXuyOb0vpTVkRaGJfuz6MGTI5n1Ntyl7kj87ZZ+p7cOtTAsVTcuDFnJibu3/nt6r/CfLz+oP451UG+luoF/yErWw5OiK7mDLQxL1TY6TkPO/D+JRULuaAvDUj2NDj0q1IlSUuI0SbKJe328eeaXf4FZroV6Olk6gdExm2SH4i0ZnSkOEG5h9Xeyng8n7l+9Ib4Ws9iVS7cJt7hmSndlQ56flPnf47ZwUG+lmdqsjt/0SNAf4Xpq7smGJx8OZfty4lbyulRl/l4Y//+q4arme9HPhzvuf2H6fQpyLW5hWGr+2aQqVnLewti7JYjoyYaDf8duSxBelu/YuC9UXI+ulG+HzBHuGXE9fDZwE52TTE+t/DdFhLtUnA+f+c51Cfdc8T5dWDjkbg7qrcT7fLBOek56f148biTcn4n/+eDlxQFtYQxk8PRQcKF2PAD+fcidb2FYasdbOCyKAzpuJFwAAAAAAAAAAAAAAAAAQEO+AAS0SDQNKhlpAAAAAElFTkSuQmCC'
    var loadingIndicator = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
    var successTick = '<div class="lds-ring"><img src="' + tickImage + '" width="40px" height="40px"/></div>';
    var modal = document.createElement('div');
    modal.id = 'progressModal';
    modal.innerHTML = '<div class="pm-content">' +
        '<div>' + 
            (message ? '<span>' + message + '</span>' : '') + 
            (isSuccess ? successTick : loadingIndicator) + 
        '</div>' +
    '</div>';
    document.body.append(modal);
}
function hideModal() {
    var modal = document.getElementById('progressModal');
    if(modal){
        modal.remove();
    }
}

(function(){
     var sessionId = getCookie("mysf_session_id");
     if(sessionId) {
        var iframe = document.getElementById('flutter-content');
        if(!iframe){
            iframe = document.createElement('iframe');
            iframe.id = 'flutter-content';
            iframe.src = flutterAppUri + '/listener';
            iframe.width = 0;
            iframe.height = 0;
            iframe.style.border = 'none';
            document.getElementsByTagName('body')[0].appendChild(iframe);
        }
        if(!isFlutterActive){
            jQuery( "iframe.flutter-content" ).addClass("hide-iframe");
        }
    }
})();

window.addEventListener("message", (event) => {
    if (event.origin == flutterAppMainUri) {
        var data = typeof(event.data) == 'string' ? JSON.parse(event.data) : event.data;
        switch (data.type) {
            case 'session':
                // debugger;
                // reload login button
                if(getCookie(COOKIE_SESSION_ID) != data.sessionId){
                    setCookie(COOKIE_SESSION_ID, data.sessionId, data.sessionId ? 1 : -1);
                    if(!getCookie(COOKIE_SESSION_CREATED)){
                        setCookie(COOKIE_SESSION_CREATED, Math.floor(Date.now()/1000), data.sessionId ? 1 : -1);
                    }
                    renderLoginButton();
                }
                break;
            case 'notification':
                setCookie(notificationData, data.message, data.message ? 1 : -1);
                renderNotificationBar();
                break;
            case 'height':
                document.getElementById('flutter-content').style.height = Math.max(data.height, 100) + 'px';
                break;
            case 'topup':
                var mdn = data.phoneNumber;
                var denomination = data.denomination.toString();
                var topup = denomination+".00";
                renderFormtopup(mdn,topup);
                break;
            case 'scroll':
                window.scrollBy({
                    top: data.deltaY,
                    left: data.deltaX,
                    behavior: 'instant'
                });
                break;
            case 'showLoadingModal':
                showModal(
                    data.success ? true : false,
                    data.message
                );
                break;
            case 'hideLoadingModal':
                hideModal();
                break;
            case 'historyBack':
                history.back();
                break;
            default:
                break;
        }
        
    }
}, false);

function sessionChanged(isValid){
    if(isLoggedIn && !isValid){
        var sessionId = getCookie(COOKIE_SESSION_ID);
        if(sessionId){
            // if < 24 hours, regenerate token
            var cookieCreated = getCookie(COOKIE_SESSION_CREATED);
            var diff = Math.floor(Date.now() / 1000) - cookieCreated;
            if(diff > 86400){
                confirmLogout();
            }
            else{
                refreshToken();
            }
        }
        else{
            // cookie has been expired or logged out in another tab
            confirmLogout();
        }
    }
    isLoggedIn = isValid;
}

function refreshToken(){
    document.getElementById('flutter-content').contentWindow.postMessage('{"type": "refreshToken"}', '*');
}

function logout(){
    jQuery('#logoutModal').modal('show'); 
}

function confirmLogout(){
    document.cookie = notificationData +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = COOKIE_SESSION_ID +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = COOKIE_SESSION_CREATED +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    jQuery(".notification-bar").css("display", "none");
    document.getElementById('flutter-content').contentWindow.postMessage('{"type": "logout"}', '*');
}

jQuery(document).on('click','#yes-logout',function(){
    confirmLogout();
    jQuery('#logoutModal').modal('hide');
});


(function(){
    var sessionId = getCookie("mysf_session_id");
     if(sessionId) {
    var hidden = "hidden";

    var onchange = function (evt) {
        var v = "visible", h = "hidden",
            evtMap = {
              focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
            };
    
        evt = evt || window.event;
        var value = '';
        if (evt.type in evtMap)
          value = evtMap[evt.type];
        else
          value = this[hidden] ? "hidden" : "visible";

        document.getElementById('flutter-content').contentWindow
            .postMessage('{"type": "visibilityChange", "value": "' + value + '"}', '*');
    }
  
    // Standards:
    if (hidden in document)
        document.addEventListener("visibilitychange", onchange);
    else if ((hidden = "mozHidden") in document)
        document.addEventListener("mozvisibilitychange", onchange);
    else if ((hidden = "webkitHidden") in document)
        document.addEventListener("webkitvisibilitychange", onchange);
    else if ((hidden = "msHidden") in document)
        document.addEventListener("msvisibilitychange", onchange);
    // IE 9 and lower:
    else if ("onfocusin" in document)
        document.onfocusin = document.onfocusout = onchange;
    // All others:
    else
        window.onpageshow = window.onpagehide
            = window.onfocus = window.onblur = onchange;
  
    // set the initial state (but only if browser supports the Page Visibility API)
    if( document[hidden] !== undefined ) {
        onchange({type: document[hidden] ? "blur" : "focus"});
    }
}
})();
