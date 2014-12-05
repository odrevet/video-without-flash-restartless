var parser = {
    BASE_URI: 'blip.tv',
    URL_PARAM_JSON: '?skin=json&no_wrap=1',

    parse_embed: function(cw) {
	const doc = cw.document;
	const XPATH_PLAYER = "//iframe[starts-with(@src, 'http://blip.tv/play')]";
	var video_info = [];
	var player;
	var video_img;
	
	var xp_res_player = doc.evaluate(XPATH_PLAYER, doc,
					 null, cw.XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
					 null );

        try{
	    while (player = xp_res_player.iterateNext()) {
    	        var videos = [];
	        var encoded_file;
	        var player_doc = utils.get(player.src);

	        if((encoded_file = player_doc.match(/"file":"(.+?)",/)) !== null){
		    var file = decodeURIComponent(encoded_file[1]);
		    file = file.replace('rss/flash', 'posts/view');
		    var json_string = utils.get(file+this.URL_PARAM_JSON);
		    var parse_data = this.parse_json_data(json_string);
		    video_img = parse_data[0];
		    videos = parse_data[1];
	        }
	        else{
		    const URL_BASE = 'http://blip.tv/file/get/';

		    const REGEX_VIDEO_URI_HD = 'bliphd720 : "(.*)"';
		    const REGEX_VIDEO_URI_SD = 'blipsd : "(.*)"';
		    const REGEX_VIDEO_URI_LD = 'blipld : "(.*)"';
		    const REGEX_VIDEO_IMG = 'config\.video\.thumbnail = "(.*)"';

		    var video_uri_hd = player_doc.match(REGEX_VIDEO_URI_HD);
		    var video_uri_sd = player_doc.match(REGEX_VIDEO_URI_SD);
		    var video_uri_ld = player_doc.match(REGEX_VIDEO_URI_LD);
		    var video_uri_img = player_doc.match(REGEX_VIDEO_IMG);

		    if(video_uri_hd[1] != ""){
		        videos.push({'quality':'hd720' , 'url':URL_BASE+video_uri_hd[1]});
		    }
		    if(video_uri_sd[1] != ""){
		        videos.push({'quality':'medium', 'url':URL_BASE+video_uri_sd[1]});
		    }
		    if(video_uri_ld[1] != ""){
		        videos.push({'quality':'low' , 'url':URL_BASE+video_uri_ld[1]});
		    }
	            
		    if(video_uri_img){
		        video_img = 'http:'+video_uri_img[1];
		        video_img = video_img.replace('THUMB_WIDTH', player.width);
		        video_img = video_img.replace('THUMB_HEIGHT', player.height);
		    }
	        }

	        video_info.push({
		    'player': player,
		    'video_img':video_img,
		    'videos': videos
	        });
	    }
        }
        finally{
            //in case iterateNext() throw invalidStateException 
            //because of a DOM alteration, return what was fetched
            return video_info;
        }

	return video_info;
    },

    parse_site: function(cw) {
	var doc = cw.document;
	var video_info = [];
	var player = doc.getElementById('PlayeriFrame');
	if(!player)return;
	
	var json_string = utils.get(doc.URL+this.URL_PARAM_JSON);
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
			 'quality': post.additionalMedia[i].media_width + '/' + 
			 post.additionalMedia[i].media_height,
			 'url':post.additionalMedia[i].url}
		       );
	}

	var video_img = post.thumbnailUrl;

	return [video_img, videos];
    }
};
