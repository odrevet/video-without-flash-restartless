var vwof= {
    parsers:{},   //hash of the parsers (loaded from jsm modules)
    parser_name:["blip", "dailymotion", "FC2", "HTML5", "niconico", "youtube", "ScreenWaveMedia"],

    /**
       Load modules listed in the extensions.vwof.modules pref variable to this.parsers hash
    */
    load_modules:function(){
	for(var i=0;i<this.parser_name.length;i++){
            let key_parser = this.parser_name[i];
	    let context = {};
	    let res = 'chrome://vwof/content/modules/'+key_parser+'.jsm';
	    Services.scriptloader.loadSubScript(res, context, "UTF-8");
	    this.parsers[key_parser] = context;
	}
    },
    set_parsers_activation:function(){
	//check in the preferences : activated a parser on page load or not
	Components.utils.import("resource://gre/modules/Services.jsm");
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"]
	    .getService(Components.interfaces.nsIPrefBranch);

	var modules_list = prefManager.getCharPref("extensions.vwof.modules");
	var modules = JSON.parse(modules_list);  //parser / value from the preferences

	for(var key_parser in this.parsers){
 	    var parser = this.parsers[key_parser].parser;

	    //if a pref is defined for this parser
	    if(modules[key_parser])
		parser['activated'] = modules[key_parser]?true:false;
	    else 
		parser['activated'] = false;
	}
    },    
    getVideoInfo:function (cw) {
	var video_info = [];	// array of video_data
	var has_parsed_site = false;
	
	for(var key_parser in this.parsers){
  	    try{
		var parser = this.parsers[key_parser].parser;
		if(parser['activated'] != true)continue;
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
			video_data[i]['source'] = this.parsers[key_parser].name;
		    }
		    
                    //concat the chunks of video(s) from this parser
		    video_info = video_info.concat(video_data);
		}
	    }
	    catch(err){
		Components.utils.reportError("vwof plugin, exception in "+key_parser+": "+err);
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
		var player = vwofPlayer.create_video_selector(video_info[i], cw);
		var replace_parent = replace_location.parentNode;
		replace_parent.replaceChild(player, replace_location);
	    }
	}
    }    
};
