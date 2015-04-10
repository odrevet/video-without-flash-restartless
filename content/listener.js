//Window listener for native UI (android)

var windowListenerNative = {
    onOpenWindow: function(aWindow) {
        // Wait for the window to finish loading
        let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
        domWindow.addEventListener("UIReady", function onLoad() {
            domWindow.removeEventListener("UIReady", onLoad, false);
            loadIntoWindow(domWindow);
        }, false);
    },
    
    onCloseWindow: function(aWindow) {},
    onWindowTitleChange: function(aWindow, aTitle) {}
};

function loadIntoWindow(window) {
    menuId = window.NativeWindow.menu.add("Detect Videos", null, function() {
        vwof.detectVideo(window.content);
    });
}

function unloadFromWindow(window) {
    if (!window || menuId == undefined)
        return;

    window.NativeWindow.menu.remove(menuId);
}

// Window listener for Desktop
var windowListener = {
    ignoreFrames:true,
    onOpenWindow: function (aXULWindow) {
	let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	aDOMWindow.addEventListener("load", function () {
	    aDOMWindow.removeEventListener("load", arguments.callee, false);
	    windowListener.loadIntoWindow(aDOMWindow, aXULWindow);
	}, false);
    },
    register: function () {
	let XULWindows = Services.wm.getXULWindowEnumerator(null);
	while (XULWindows.hasMoreElements()) {
	    let aXULWindow = XULWindows.getNext();
	    let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	    windowListener.loadIntoWindow(aDOMWindow, aXULWindow);
	}
	// Listen to new windows
	Services.wm.addListener(windowListener);
    },
    unregister: function () {
	// Unload from any existing windows
	let XULWindows = Services.wm.getXULWindowEnumerator(null);
	while (XULWindows.hasMoreElements()) {
	    let aXULWindow = XULWindows.getNext();
	    let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	    windowListener.unloadFromWindow(aDOMWindow, aXULWindow);
	}
	//Stop listening so future added windows dont get this attached
	Services.wm.removeListener(windowListener);
    },
    loadIntoWindow: function (aDOMWindow, aXULWindow) {
	if (!aDOMWindow) {
	    return;
	}
	if (aDOMWindow.gBrowser) {
	    aDOMWindow.gBrowser.addEventListener('DOMContentLoaded', onPageLoad, false);
	    if (aDOMWindow.gBrowser.tabContainer) {
		//start - go through all tabs in this window we just added to
		var tabs = aDOMWindow.gBrowser.tabContainer.childNodes;
		for (var i = 0; i < tabs.length; i++) {
		    var tabBrowser = tabs[i].linkedBrowser;
		    var win = tabBrowser.contentWindow;
		}
		//end - go through all tabs in this window we just added to
	    } else {
		//does not have tabContainer
		var win = aDOMWindow.gBrowser.contentWindow;
	    }
	}
    },
    unloadFromWindow: function (aDOMWindow, aXULWindow) {
	if (!aDOMWindow) {
	    return;
	}
	if (aDOMWindow.gBrowser) {
	    aDOMWindow.gBrowser.removeEventListener('DOMContentLoaded', onPageLoad, false);
	    if (aDOMWindow.gBrowser.tabContainer) {
		//has tabContainer
		//start - go through all tabs in this window we just added to
		var tabs = aDOMWindow.gBrowser.tabContainer.childNodes;
		for (var i = 0; i < tabs.length; i++) {
		    var tabBrowser = tabs[i].linkedBrowser;
		    var win = tabBrowser.contentWindow;
		}
		//end - go through all tabs in this window we just added to
	    } else {
		//does not have tabContainer
		var win = aDOMWindow.gBrowser.contentWindow;
	    }
	} else {
	    //window does not have gBrowser
	}
    }
};

/**
   Listener that observe the prefs variables

   If the module list changes (new module, module deactivated/activated), the parser list is reloaded
*/
var PrefObserver = {
    register: function() {
	var prefService = Components.classes["@mozilla.org/preferences-service;1"]
	    .getService(Components.interfaces.nsIPrefService);
	this.branch = prefService.getBranch("extensions.vwof.");
	this.branch.addObserver("", this, false);
    },

    unregister: function() {
	this.branch.removeObserver("", this);
    },

    observe: function(aSubject, aTopic, aData) {
	switch (aData) {
	case "modules":
	    vwof.set_parsers_activation();
	    break;
	}
    }
}
