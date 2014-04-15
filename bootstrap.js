const {interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');

function listenPageLoad(event) {
    var cw = event.originalTarget.defaultView;
    if (cw.frameElement && windowListener.ignoreFrames) {
	return;  //dont want to watch frames
    }
    vwof.detectVideo(cw);
}

function startup(aData, aReason) {
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
