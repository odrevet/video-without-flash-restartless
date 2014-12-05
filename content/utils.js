var utils = {

    get:function(uri){
	const XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1",
						      "nsIXMLHttpRequest",
						      "open");
	
	let xmlhttp = XMLHttpRequest("GET", uri, false);
	xmlhttp.send();
	return xmlhttp.responseText;
    },
    
    url_vars_to_array: function(url){
	var arr_variable = url.split('&');
	var arr_assoc = {};
	var i;
	
	for(i=0;i<arr_variable.length;i++){
	    var arr_tmp = arr_variable[i].split('=');
	    arr_assoc[arr_tmp[0]] = arr_tmp[1];
	}
	return arr_assoc;
    },

    // return the two-digit hexadecimal code for a byte
    toHexString:function(charCode)
    {
	return ("0" + charCode.toString(16)).slice(-2);
    },

    // do a md5 sum
    md5:function(str){
	var converter =
	    Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
	    createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

	// we use UTF-8 here, you can choose other encodings.
	converter.charset = "UTF-8";
	// result is an out parameter,
	// result.value will contain the array length
	var result = {};
	// data is an array of bytes
	var data = converter.convertToByteArray(str, result);
	var ch = Components.classes["@mozilla.org/security/hash;1"]
            .createInstance(Components.interfaces.nsICryptoHash);
	ch.init(ch.MD5);
	ch.update(data, data.length);
	var hash = ch.finish(false);

	// convert the binary hash data to a hex string.
	var s = [this.toHexString(hash.charCodeAt(i)) for (i in hash)].join("");

	return s;
    }
};
