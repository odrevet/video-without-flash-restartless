const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/NetUtil.jsm');

const PREF_BRANCH = "extensions.vwof.";

function isAndroid() {
    return Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime)
        .widgetToolkit.toLowerCase() == "android";
}

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

//////////////////

function startup(data,reason) {
    Services.scriptloader.loadSubScript("chrome://vwof/content/prefs.js")
    Services.scriptloader.loadSubScript('chrome://vwof/content/vwof.js');    
    Services.scriptloader.loadSubScript('chrome://vwof/content/player.js');
    Services.scriptloader.loadSubScript('chrome://vwof/content/utils.js');
    Services.scriptloader.loadSubScript('chrome://vwof/content/listener.js');

    //prefs
    PrefObserver.register();
    setDefaultPref(PREF_BRANCH, "modules", 
                   '{"HTML5":0, "blip":1, "dailymotion":1, "niconico":1, "FC2":1, "ScreenWaveMedia":1}');
    setDefaultPref(PREF_BRANCH, "prefered_quality", 'medium');
    setDefaultPref(PREF_BRANCH, "prefered_format", 'webm');
    setDefaultPref(PREF_BRANCH, "activate_onload", true);

    vwof.load_modules();
    vwof.set_parsers_activation();

    if(!isAndroid()){
        windowListener.register();  
        Services.wm.addListener(windowListener);
    }
    else{
        let windows = Services.wm.getEnumerator("navigator:browser");
        while (windows.hasMoreElements()) {
            let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
            loadIntoWindow(domWindow);            
        }
        Services.wm.addListener(windowListenerNative);
    }
}

function shutdown(data,reason) {
    if (reason == APP_SHUTDOWN)
        return;

    if(!isAndroid()){
        // Stop listening to newly opened windows 
        Services.wm.removeListener(windowListener);
    }
    else{
        // Unload from any existing windows
        let windows = Services.wm.getEnumerator("navigator:browser");
        while (windows.hasMoreElements()) {
            let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
            unloadFromWindow(domWindow);
        }
    }
}

function install(data,reason) { }

function uninstall(data,reason) { }
