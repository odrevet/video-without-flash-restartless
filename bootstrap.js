const {interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/NetUtil.jsm');

const PREF_BRANCH = "extensions.vwof.";

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

function oncommand_detect_video(window){
    //window is browser.xul. Pass the contentWindow of the document
    vwof.detectVideo(window.gBrowser.contentDocument.defaultView);
}

function init(window){
    let doc = window.document;
    keyset = doc.getElementById('mainKeyset');

    //keyboard shortcut
    let key = doc.createElement('key');
    key.setAttribute('id', 'vwof-key');
    key.addEventListener("command", function (){oncommand_detect_video(window);});
    key.setAttribute('key', 'w');
    key.setAttribute('modifiers', 'alt');
    keyset.appendChild(key);
    keyset.parentElement.appendChild(keyset);
}

function startup(aData, aReason) {
    Services.scriptloader.loadSubScript("chrome://vwof/content/prefs.js")
    Services.scriptloader.loadSubScript('chrome://vwof/content/vwof.js');    
    Services.scriptloader.loadSubScript('chrome://vwof/content/player.js');
    Services.scriptloader.loadSubScript('chrome://vwof/content/utils.js');
    Services.scriptloader.loadSubScript('chrome://vwof/content/youtube_utils.js');    
    Services.scriptloader.loadSubScript('chrome://vwof/content/listener.js');
    windowListener.register();
    PrefObserver.register();

    setDefaultPref(PREF_BRANCH, "modules", '{"HTML5":1, "blip":1, "youtube":1, "dailymotion":1, "niconico":1, "FC2":1, "ScreenWaveMedia":1}');
    setDefaultPref(PREF_BRANCH, "prefered_quality", 'medium');
    setDefaultPref(PREF_BRANCH, "prefered_format", 'webm');
    setDefaultPref(PREF_BRANCH, "activate_onload", true);

    // Load into any existing windows
    let wm = Services.wm,
    enumerator = wm.getEnumerator('navigator:browser');
    while (enumerator.hasMoreElements()) {
        init(enumerator.getNext().QueryInterface(Ci.nsIDOMWindow));
    }

    vwof.load_modules();
    vwof.set_parsers_activation();
}

function shutdown(aData, aReason) {
    if (aReason == APP_SHUTDOWN) return;
    windowListener.unregister();
    PrefObserver.unregister();
}

function install() {}

function uninstall() {}
