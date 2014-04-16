const {interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');

const PREF_BRANCH = "extensions.vwof.";
const PREFS = {
    "modules":'{"HTML5":1, "springboard":1, "blip":1, "youtube":1, "dew":1, "SWM":1, "dailymotion":1, "ustream":1, "niconico":1, "FC2":1}',
    "prefered_quality":'medium',
    "prefered_format":'webm'
};

function setDefaultPrefs() {
    let branch = Services.prefs.getDefaultBranch(PREF_BRANCH);
    for (let [key, val] in Iterator(PREFS)) {
        branch.setCharPref(key, val);
    }
}

function listenPageLoad(event) {
    var cw = event.originalTarget.defaultView;
    if (cw.frameElement && windowListener.ignoreFrames) {
	return;  //dont want to watch frames
    }
    vwof.detectVideo(cw);
}

function startup(aData, aReason) {
    setDefaultPrefs();    
    Services.scriptloader.loadSubScript('chrome://vwof/content/vwof.js');    
    Services.scriptloader.loadSubScript('chrome://vwof/content/player.js');
    Services.scriptloader.loadSubScript('chrome://vwof/content/utils.js');
    Services.scriptloader.loadSubScript('chrome://vwof/content/listener.js');
    windowListener.register();
    PrefObserver.register();
    vwof.load_modules();
}

function shutdown(aData, aReason) {
    if (aReason == APP_SHUTDOWN) return;
    windowListener.unregister();
    PrefObserver.unregister();
}

function install() {}

function uninstall() {}
