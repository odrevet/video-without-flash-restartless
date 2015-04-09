const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/NetUtil.jsm');

const PREF_BRANCH = "extensions.vwof.";

var menuId;
///
function listenPageLoad(event) {
    var cw = event.originalTarget.defaultView;
    if (cw.frameElement && windowListener.ignoreFrames) {
	return;  //dont want to watch frames
    }
    
    var prefManager = Components.classes["@mozilla.org/preferences-service;1"].
                      getService(Components.interfaces.nsIPrefBranch);
    var activate_onload = prefManager.getBoolPref(PREF_BRANCH+"activate_onload");
    if(activate_onload){vwof.detectVideo(cw);}
}

function init(window){
    let doc = window.document;
    keyset = doc.getElementById('mainKeyset');

    //keyboard shortcut
    let key = doc.createElement('key');
    key.setAttribute("oncommand", "//");
    key.setAttribute('key', 'w');
    key.setAttribute('modifiers', 'alt');
    key.setAttribute('id', 'vwof-key');
    key.addEventListener("command", function (){
     vwof.detectVideo(window.gBrowser.contentDocument.defaultView);
    });
    keyset.appendChild(key);
    keyset.parentElement.appendChild(keyset);
}


function loadIntoWindow(window) {
    init(window);
    if (!window)
        return;

    menuId = window.NativeWindow.menu.add("Detect Videos", null, function() {
        vwof.detectVideo(window.content);
    });
}

function unloadFromWindow(window) {
    if (!window)
        return;
    window.NativeWindow.menu.remove(menuId);
}

var windowListenerUI = {
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

function startup(aData, aReason) {
    Services.scriptloader.loadSubScript("chrome://vwof/content/prefs.js")
    Services.scriptloader.loadSubScript('chrome://vwof/content/vwof.js');    
    Services.scriptloader.loadSubScript('chrome://vwof/content/player.js');
    Services.scriptloader.loadSubScript('chrome://vwof/content/utils.js');

    Services.scriptloader.loadSubScript('chrome://vwof/content/listener.js');
    windowListener.register();
    PrefObserver.register();

    setDefaultPref(PREF_BRANCH, "modules", '{"HTML5":0, "blip":1, "dailymotion":1, "niconico":1, "FC2":1, "ScreenWaveMedia":1}');
    setDefaultPref(PREF_BRANCH, "prefered_quality", 'medium');
    setDefaultPref(PREF_BRANCH, "prefered_format", 'webm');
    setDefaultPref(PREF_BRANCH, "activate_onload", true);

    vwof.load_modules();
    vwof.set_parsers_activation();

    // Load into any existing windows
    let windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
        let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
        loadIntoWindow(domWindow);
    }

    // Load into any new windows
    Services.wm.addListener(windowListenerUI);
}

function shutdown(aData, aReason) {
    // When the application is shutting down we normally don't have to clean
    // up any UI changes made
    if (aReason == APP_SHUTDOWN)
        return;

    // Stop listening for new windows
    Services.wm.removeListener(windowListenerUI);

    // Unload from any existing windows
    let windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
        let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
        unloadFromWindow(domWindow);
    }
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}
