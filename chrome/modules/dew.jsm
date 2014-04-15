var parser = {
    parse_embed: function(cw) {
	const XPATH_PLAYER = "//embed[contains(@src, 'dewplayer')]";
	const REGEX_SOURCE = /[&\?]?son=([^&?]+)/;
	var video_info = [];
	var xp_res_player = cw.document.evaluate(XPATH_PLAYER, cw.document, null, cw.XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
	
	while (player = xp_res_player.iterateNext()) {
	    var video_uri = player.src.match(REGEX_SOURCE)[1];
	    
	    if(!video_uri)continue;
	    video_info.push({
		'player':player,
		'videos': [ {'quality':'medium', 'url':video_uri} ]
	    });
	}
	
	return video_info;
    }
};
