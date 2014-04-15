var vwof= {
    parsers:{},   //hash of the parsers (loaded from jsm modules)

    /**
       Load modules listed in the extensions.vwof.modules pref variable to this.parsers hash
    */
    load_modules:function(){
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var modules_list = prefManager.getCharPref("extensions.vwof.modules");
	var modules = JSON.parse(modules_list);

	for(var key_parser in modules){
	    if(modules[key_parser] == 1){
		let context = {};
		let res = 'chrome://vwof/content/modules/'+key_parser+'.jsm';
		Services.scriptloader.loadSubScript(res, context, "UTF-8");
		this.parsers[key_parser] = context;
	    }
	}
    },
    getVideoInfo:function (cw) {
	var video_info = [];	// array of video_data
	var has_parsed_site = false;
	
	for(var key_parser in this.parsers){
	    
  	    try{
		var parser = this.parsers[key_parser].parser;
		var video_data = [];  //array of video links with quality

		//if the parser has a URI and it's the current location
		if(parser.BASE_URI && cw.location.hostname == parser.BASE_URI){
		    video_data = parser.parse_site(cw);
		    has_parsed_site = true;
		}
		else if(parser.parse_embed){
		    video_data = parser.parse_embed(cw);
		}

		//if there is at least a video url retreived from the parser
		if(video_data.length >= 1){		    
		    //set the source (name of the parser)
		    for(var i=0;i < video_data.length;i++){
			video_data[i]['source'] = key_parser;
		    }
		    
		    video_info = video_info.concat(video_data);    //concat the chunks of video(s) from this parser
		}
	    }
	    catch(err){
		cw.alert("vwof plugin, exception in parser "+key_parser+": "+err);
	    };

	    //official web sites do not embed several videos, so don't use other parsers
	    if(has_parsed_site){break;}
	}

	return video_info;
    },
    
    detectVideo:function(cw) {

	var video_info = this.getVideoInfo(cw);

	for (var i = 0; i < video_info.length; i++) {
	    if(video_info[i]['player']){
    		var replace_location = video_info[i]['player'];
		var player = vwofPlayer.create_player(video_info[i], cw);
		var replace_parent = replace_location.parentNode;
		replace_parent.replaceChild(player, replace_location);
	    }
	    else{
		var j = vwofPlayer.find_prefered_video(video_info[i].videos);
		gBrowser.selectedTab = gBrowser.addTab(video_info[i].videos[j].url);
	    }
	}
    }    
};
