var parser = {
    BASE_URI: 'blip.tv',
    URL_PARAM_JSON: '?skin=json&no_wrap=1',
    parse_embed: function(cw) {
	const XPATH_PLAYER = "//iframe[starts-with(@src, 'http://blip.tv/play')]";
	var video_info = [];
	var player;
	var video_img;
	
	var xp_res_player = cw.document.evaluate(XPATH_PLAYER, cw.document, null, cw.XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );
	while (player = xp_res_player.iterateNext()) {
    	    var videos = [];
	    var player_doc = player.contentDocument;
	    var episode_info = player_doc.getElementById('EpisodeInfo');
	    if(episode_info){
		//megaplaya method
		var data_episode_page = episode_info.getAttribute('data-episode-page');
		var json_string = utils.get(data_episode_page+this.URL_PARAM_JSON);
		var parse_data = this.parse_json_data(json_string);
		video_img = parse_data[0];
		videos = parse_data[1];		
	    }
	    else{
		//embed method		
		var encoded_file = player_doc.body.textContent.match(/"file":"(.+?)",/)[1];
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
