var checkbox_wide = document.getElementById("vwof_yt_wide");
var wide = vwofChrome.youtubeUtils.yt_is_wide();
checkbox_wide.setAttribute("checked", wide);

var prefPane = document.getElementById('vwof_pref_modules');
var s_modules = document.getElementById('extensions.vwof.modules').value;
modules = JSON.parse(s_modules);

var element_label = document.createElement('label');
element_label.setAttribute('value', ' -- Enable/disable modules -- ');
prefPane.appendChild(element_label);

for(var key_module in modules){
    var element_checkbox = document.createElement('checkbox');
    element_checkbox.setAttribute('label', key_module);
    element_checkbox.setAttribute('checked', modules[key_module]?'true':'false');
    element_checkbox.setAttribute('oncommand', "update_module(event)");
    prefPane.appendChild(element_checkbox);
}

function update_module(event){
    var l = event.target.getAttribute('label');
    var c = event.target.hasAttribute('checked')?1:0;

    modules[l] = c;
    var s_modules = JSON.stringify(modules);

    var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    prefManager.setCharPref("extensions.vwof.modules", s_modules);
    
}

