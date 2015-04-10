const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/NetUtil.jsm');

const PREF_BRANCH = "extensions.vwof.";

var menuId;

function onPageLoad(event) {
    var cw = event.originalTarget.defaultView;    
    var prefManager = Components.classes["@mozilla.org/preferences-service;1"].
                      getService(Components.interfaces.nsIPrefBranch);
    var activate_onload = prefManager.getBoolPref(PREF_BRANCH+"activate_onload");
    if(activate_onload){vwof.detectVideo(cw);}
}

function init_keyboard_shortcut(window){
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

function isAndroid() {
  return Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime)
    .widgetToolkit.toLowerCase() == "android"
}

function startup(aData, aReason) {
    Services.scriptloader.loadSubScript("chrome://vwof/content/prefs.js")
    Services.scriptloader.loadSubScript('chrome://vwof/content/vwof.js');    
    Services.scriptloader.loadSubScript('chrome://vwof/content/player.js');
    Services.scriptloader.loadSubScript('chrome://vwof/content/utils.js');
    Services.scriptloader.loadSubScript('chrome://vwof/content/listener.js');

    //prefs
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
        if (!isAndroid()){
            //Desktop
            //init keyboard shortcut
            init_keyboard_shortcut(domWindow);
        }
        else{
            //Mobile, init UI shortcut
            loadIntoWindow(domWindow);

            //listen for page load
            domWindow.BrowserApp.deck.addEventListener("load", onPageLoad, true);
        }
    }

    // Load into any new windows
    if (!isAndroid()){
        windowListener.register();
    }
    else{
        Services.wm.addListener(windowListenerNative);
    }
}

function shutdown(aData, aReason) {
    // When the application is shutting down we normally don't have to clean
    // up any UI changes made
    if (aReason == APP_SHUTDOWN)
        return;

    // Stop listening for new windows
    Services.wm.removeListener(windowListenerNative);

    // Unload from any existing windows
    let windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
        let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
        unloadFromWindow(domWindow);
    }
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}
