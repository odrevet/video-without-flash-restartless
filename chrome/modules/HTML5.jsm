/**
   HTML5 parser
   used to play videos which use codec unsupported by default in firefox
   but can be readed with the help of a media plugin (vlc-web-plugin, mplayer)
*/

var parser = {
    parse_embed: function(cw) {
	const doc = cw.document;
	const XPATH_PLAYER = "//video";
	const XPATH_VIDEO_URI = 'source';
	var video_info = [];
	var xp_res_player = doc.evaluate(XPATH_PLAYER, doc, null, 
					 cw.XPathResult.ORDERED_NODE_ITERATOR_TYPE,
					 null);

	while (player = xp_res_player.iterateNext()) {
	    var videos = [];
            var xp_res_video = doc.evaluate(XPATH_VIDEO_URI, player, null, 
					    cw.XPathResult.ORDERED_NODE_ITERATOR_TYPE,
					    null);

	    while (node_video = xp_res_video.iterateNext()) {
		videos.push({'format': node_video.type, 'url': node_video.src});
	    }

	    video_info.push({
		'player':player,
		'video_img':player.poster,
		'videos': videos
	    });
	}

	return video_info;
    }
};
