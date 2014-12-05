var youtubeUtils = {
    toggle_yt_wide:function (event){
	var c = event.target.hasAttribute('checked')?1:0;
	var wide;
	if(c == 1){
	    wide = "wide=1;";
	}
	else{
	    wide = "wide=0;";
	}

	var url = "http://youtube.com";
	var cookieString = wide+"domain=youtube.com;expires=Fri, 31 Dec 9999 23:59:59 GMT";
	
	var cookieUri = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(url, null, null);
	Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService).setCookieString(cookieUri, null, cookieString, null);
    },

    yt_is_wide:function(){
	var wide = false;
	try
	{
	    var ios = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	    var uri = ios.newURI("http://www.youtube.com/", null, null);

	    var cookieSvc = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);
	    var cookie = cookieSvc.getCookieString(uri, null);

	    if(cookie.indexOf("wide=1") != -1){
		wide=true;
	    }
	}
	catch (errorInfo)
	{
	    Components.utils.reportError(errorInfo);
	}
	return wide;
    }
};
