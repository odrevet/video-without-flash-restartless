var parser = {
    BASE_URI : 'www.youtube.com',
    API_GET_VIDEO:'http://youtube.com/get_video_info?video_id=VIDEO_ID',
    
    /**
       parse a video on the web site
    */
    parse_site:function(cw) {
	const REGEX_VIDEO_ID_SITE = /watch\?v=([\w\-]{11})/;
	var doc = cw.document;	
	var video_info = [];
	var id;
	
	//get the video id from the current url
	if(url_match = doc.URL.match(REGEX_VIDEO_ID_SITE)){
	    id = url_match[1];
	}
	else{return;}

	var player_api = doc.getElementById('player-api');
	if(player_api){
	    player_api.setAttribute('id', 'vwof_player-api');  //prevent the player-api div to be erased by the missing plugin tv-static message
	}
	else {
	    player_api = doc.getElementById('vwof_player-api');  //the page has previously been proceeded
	}

	//remove all child from the player api, in case we need to load a new video
	while (player_api.firstChild) {
	    player_api.removeChild(player_api.firstChild);
	}

	var player = doc.createElement('div');
	player_api.appendChild(player);
	
	var api_video_uri = this.API_GET_VIDEO.replace('VIDEO_ID', id);
	var data = utils.get(api_video_uri);
	var video_data = this.parse_data(data);
	video_data['player'] = player;
	
	//this div overlap with the player when the screen resolution is low
	var guide =  doc.getElementById('guide');
	if(guide)guide.style.display = 'none';
	
	video_info.push(video_data);
	
	return video_info;
    },

    /**
       parse iframe embed in sites, potentialy several videos
    */
    parse_embed: function(cw) {
	var video_info = [];
	var player;

	//Search embed videos in iframes
	const XPATH_PLAYER_IFRAME = "//iframe[contains(@src, '"+this.BASE_URI+"/embed')]";
	const REGEX_VIDEO_ID_IFRAME = /embed\/([\w\-]{11})/;
	
	var xp_res_player = cw.document.evaluate(XPATH_PLAYER_IFRAME, cw.document, null, cw.XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );

	while (player = xp_res_player.iterateNext()) {

	    var id = player.src.match(REGEX_VIDEO_ID_IFRAME)[1];
	    var api_video_uri = this.API_GET_VIDEO.replace('VIDEO_ID', id);
	    var data = utils.get(api_video_uri);

	    var parsed_array = this.parse_data(data);
	    parsed_array['player'] = player;
	    video_info.push(parsed_array);
	}

	//search embed videos in objects
	const XPATH_OBJECT_PARAM = "//param[contains(@value, 'http://www.youtube.com/v/')]";
	const REGEX_VIDEO_ID_OBJECT_PARAM = /v\/([\w\-]{11})/;

	xp_res_player = cw.document.evaluate(XPATH_OBJECT_PARAM, cw.document, null, cw.XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );

	while (player = xp_res_player.iterateNext()) {
	    var id = player.value.match(REGEX_VIDEO_ID_OBJECT_PARAM)[1];
	    var api_video_uri = this.API_GET_VIDEO.replace('VIDEO_ID', id);
	    var data = utils.get(api_video_uri);

	    var parsed_array = this.parse_data(data);
	    parsed_array['player'] = player.parentNode;
	    video_info.push(parsed_array);
	}
	
	return video_info;
    },


    /**
       this is where the video data are retreived from the enormous json
       returned by the youtube's get_video_info page
    */
    parse_data: function(data){
	var videos = [];
	var assoc_data = utils.url_vars_to_array(data);

	var url_encoded_fmt_stream_map = assoc_data['url_encoded_fmt_stream_map'];
	var url_decoded_fmt_stream_map = decodeURIComponent(url_encoded_fmt_stream_map);
	var arr_url_decoded_fmt_stream_map = url_decoded_fmt_stream_map.split(',');
	var i;
	
	for(i=0;i<arr_url_decoded_fmt_stream_map.length;i++){
	    var assoc_url_decoded_fmt_stream = utils.url_vars_to_array(arr_url_decoded_fmt_stream_map[i]);
	    var encoded_uri = assoc_url_decoded_fmt_stream['url'];
	    var decoded_uri = decodeURIComponent(encoded_uri);
	    decoded_uri += '&signature='+assoc_url_decoded_fmt_stream['sig'];    //add the signature to the decoded url
	    var type = decodeURIComponent(assoc_url_decoded_fmt_stream['type']);
	    var quality = decodeURIComponent(assoc_url_decoded_fmt_stream['quality']);

	    //small is replaced by low so the prefered format can detect the quality
	    if(quality == 'small')quality = 'low';
	    //remove some part of the mime type (we know it's a video)
	    //we want to display only the type and codecs
	    if(type){
		type=type.replace('video/', '');
		type=type.replace(/;\+codecs="(.+)"/, '($1)');
	    }
	    
	    videos.push( {'quality': quality, 'format':type, 'url':decoded_uri} );
	}
	
	var video_info = {
	    'video_img': decodeURIComponent(assoc_data['iurl']),
	    'videos': videos
	};

	return video_info;
    }
};
