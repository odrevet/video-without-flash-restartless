var prefPane = document.getElementById('vwof_pref_modules');
var s_modules = document.getElementById('extensions.vwof.modules').value;
modules = JSON.parse(s_modules);

var element_label = document.createElement('label');
element_label.setAttribute('value', 'Module activation');
prefPane.appendChild(element_label);

let element_grid = document.createElement('grid');
var element_columns = document.createElement('columns');
var element_column_site = document.createElement('column');
var element_column_embed = document.createElement('column');
var element_rows = document.createElement('rows');

element_columns.appendChild(element_column_site);
element_columns.appendChild(element_column_embed);
element_grid.appendChild(element_columns);
element_grid.appendChild(element_rows);

for(var i=0;i<vwof.parser_name.length;i++){
    var element_row = document.createElement('row');

    let key_module = vwof.parser_name[i];

    var element_label_key = document.createElement('label');
    element_label_key.setAttribute('value', key_module);
    element_row.appendChild(element_label_key);

    var element_checkbox_site = document.createElement('checkbox');
    element_checkbox_site.setAttribute('checked', modules[key_module]?'true':'false');
    element_checkbox_site.setAttribute('class', key_module);
    element_checkbox_site.addEventListener('command', update_module);
    element_row.appendChild(element_checkbox_site);

    element_rows.appendChild(element_row);
}

prefPane.appendChild(element_grid);

function update_module(event){
    var l = event.target.getAttribute('class');
    var c = event.target.hasAttribute('checked')?1:0;

    modules[l] = c;
    var s_modules = JSON.stringify(modules);

    var prefManager = Components.classes["@mozilla.org/preferences-service;1"].
	getService(Components.interfaces.nsIPrefBranch);

    prefManager.setCharPref("extensions.vwof.modules", s_modules);
}

