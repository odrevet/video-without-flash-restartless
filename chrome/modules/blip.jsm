var EXPORTED_SYMBOLS = ["parser"];
var parser = {
    BASE_URI: 'blip.tv',
    URL_PARAM_JSON: '?skin=json&no_wrap=1',
    parse_embed: function(cw) {
	const XPATH_PLAYER = "//iframe[starts-with(@src, 'http://blip.tv/play')]";
	var video_info = [];
	var player;
	var video_img;

	//XPATH for the megaplaya method
	const XPATH_VIDEO_URI_HD = '//div[@id="EpisodeInfo"]/@data-bliphd720';		
	const XPATH_VIDEO_URI_SD = '//div[@id="EpisodeInfo"]/@data-blipsd';
	const XPATH_VIDEO_URI_LD = '//div[@id="EpisodeInfo"]/@data-blipld';
	const XPATH_VIDEO_IMG = '//div[@id="EpisodeInfo"]/@data-episode-thumbnail';
	
	var xp_res_player = cw.document.evaluate(XPATH_PLAYER, cw.document, null, cw.XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );
	while (player = xp_res_player.iterateNext()) {
    	    var videos = [];
	    var player_doc = player.contentDocument;

	    if(player_doc.getElementById('EpisodeInfo')){
		//megaplaya method
		var video_uri_hd = player_doc.evaluate(XPATH_VIDEO_URI_HD, player_doc, null, cw.XPathResult.STRING_TYPE, null).stringValue;	    
		var video_uri_sd = player_doc.evaluate(XPATH_VIDEO_URI_SD, player_doc, null, cw.XPathResult.STRING_TYPE, null).stringValue;
		var video_uri_ld = player_doc.evaluate(XPATH_VIDEO_URI_LD, player_doc, null, cw.XPathResult.STRING_TYPE, null).stringValue;

		if(video_uri_hd){videos.push({'quality':'hd720' , 'url':video_uri_hd});}
		if(video_uri_sd){videos.push({'quality':'medium', 'url':video_uri_sd});}
		if(video_uri_ld){videos.push({'quality':'low'   , 'url':video_uri_ld});}
		
		var video_img = player_doc.evaluate(XPATH_VIDEO_IMG, player_doc, null, cw.XPathResult.STRING_TYPE, null).stringValue;
		if(video_img){
		    video_img = video_img.replace('THUMB_WIDTH', player.width);
		    video_img = video_img.replace('THUMB_HEIGHT', player.height);
		}
	    }
	    else{
		//embed method
		const XPATH_SCRIPT = "/html/body/script[8]";
		var script_content = player_doc.evaluate(XPATH_SCRIPT, player_doc, null, cw.XPathResult.STRING_TYPE, null).stringValue;
		
		var encoded_file = script_content.match(/"file":"(.+?)",/)[1];
		var file = decodeURIComponent(encoded_file);
		file = file.replace('rss/flash', 'posts/view');
		var json_string = utils.get(file+this.URL_PARAM_JSON);
		var parse_data = this.parse_json_data(json_string);
		video_img = parse_data[0];
		videos = parse_data[1];
	    }
	    
	    video_info.push({
		'player': player,
		'video_img':video_img,
		'videos': videos
	    });
	}

	return video_info;
    },

    parse_site: function(cw) {
	var video_info = [];
	var player = cw.document.getElementById('PlayeriFrame');
	if(!player)return;
	
	var json_string = utils.get(cw.document.URL+this.URL_PARAM_JSON);
	var parse_data = this.parse_json_data(json_string);
	var video_img = parse_data[0];
	var videos = parse_data[1];
	
	video_info.push({
	    'player': player,
	    'video_img': video_img,
	    'videos': videos
	});

	return video_info;
    },

    parse_json_data: function(json_string){
	var post = JSON.parse(json_string).Post;
	
	var videos = [];
	for(var i=0;i<post.additionalMedia.length;i++){
	    var format = post.additionalMedia[i].primary_mime_type;
	    if(format == 'text/plain')continue;
	    
	    //remove video part of the mime type for a prettier display
	    format=format.replace('video/', '');

	    videos.push({'format': format,
			 'quality': post.additionalMedia[i].media_width + '/' + post.additionalMedia[i].media_height,
			 'url':post.additionalMedia[i].url}
		       );
	}

	var video_img = post.thumbnailUrl;

	return [video_img, videos];
    }
};
