var parser = {
    parse_embed: function(cw) {
	var player;
	var videos = [];
	var video_info = [];	
	const doc = cw.document;
	const REGEX_ID = /id=(.+)/;
	const URL_VIDEO = 'http://video2.screenwavemedia.com/vod/VIDEO_ID_QUALITY.mp4';
	const URL_IMAGE = 'http://image.screenwavemedia.com/VIDEO_ID_thumb_640x360.jpg';
	const video_quality = ['audio', 'low', 'med', 'high', 'hd1'];
	const URL_PLAYER_FRAME = 'http://player.screenwavemedia.com/play/player.php';
	const XPATH_PLAYER_FRAME = "//iframe[starts-with(@src, '"+URL_PLAYER_FRAME+"')]"
	const URL_PLAYER_SCRIPT = 'http://player.screenwavemedia.com/play/play.php';
	const XPATH_PLAYER_SCRIPT = "//script[starts-with(@src, '"+URL_PLAYER_SCRIPT+"')]";
	
	var xp_res_player_frame = doc.evaluate(XPATH_PLAYER_FRAME, doc, null, 
					       cw.XPathResult.FIRST_ORDERED_NODE_TYPE, 
					       null);

	var node = xp_res_player_frame.singleNodeValue;

	if(node){
	   player = node;
	}
	else{
	    var xp_res_player_script = doc.evaluate(XPATH_PLAYER_SCRIPT, doc, null, 
					       cw.XPathResult.FIRST_ORDERED_NODE_TYPE, 
					       null);

	    node = xp_res_player_script.singleNodeValue;
	    if(!node)return;

	    player = doc.getElementById('videoarea');
	    player.id = "swmvwof_player";
	}

	if(!node)return;

	var video_id = node.src.match(REGEX_ID)[1];

	for (var i=0;i<video_quality.length;i++) {
	    var url = URL_VIDEO.replace('VIDEO_ID', video_id);
	    url = url.replace("QUALITY", video_quality[i]);
	    videos.push( {'quality': video_quality[i], 'format':'mp4', 'url':url} );
	}

	var video_img = URL_IMAGE.replace('VIDEO_ID', video_id);
	
	video_info.push({
	    'player': player,
	    'video_img':video_img,
	    'videos': videos
	});

	return video_info;
    }
};
