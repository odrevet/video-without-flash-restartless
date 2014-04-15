var parser = {
    BASE_URI        : 'www.dailymotion.com',
    parse_site:function(cw) {
	var video_info = [];

	var player = cw.document.getElementById('container_player_main');	
	var video_data = this.get_video_data(player.contentDocument);
	video_data['player'] = player;

	video_info.push(video_data);
	return video_info;
    },

    parse_embed: function(cw) {
	const XPATH_PLAYER = "//iframe[contains(@src, 'http://"+ this.BASE_URI +"/embed')]";

	var video_info = [];
	var xp_res_player = cw.document.evaluate(XPATH_PLAYER, cw.document, null, cw.XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );
	var player;
	
	while (player = xp_res_player.iterateNext()) {

	    var video_data = this.get_video_data(player.contentDocument);
	    
	    video_data['player'] = player;
	    video_info.push(video_data);
	}
	return video_info;
    },

    get_video_data: function(contentDocument){
	var info = contentDocument.body.innerHTML.match(/var info = ({.*})/);
	var json_info = JSON.parse(info[1]);
	var videos = [];

	for(info_key in json_info){
	    if( (video_data = info_key.match(/stream_(.*)_(.*)_url/) ) && json_info[info_key] != undefined){
		var format = video_data[1];
		var quality = video_data[2];

		switch(quality){
		    case 'hq':quality = 'large';break;
		    case 'hd':quality = 'large';break;
		    case 'ld':quality = 'low';break;
		}
		
		videos.push( {'format':format, 'quality':quality, 'url':json_info[info_key]} );
	    }
	}
	
	var video_info = {
	    'video_img': json_info.thumbnail_large_url,
	    'videos': videos
	};	
	
	return video_info;
	
    },

};
