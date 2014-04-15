var parser = {
    parse_embed: function(cw) {
	const XPATH_PLAYER = "//iframe[starts-with(@src, 'http://cms.springboardplatform.com/embed_iframe')]";
	const XPATH_VIDEO_URI = '/html/head/meta[@property="og:video"]/@content';
	const XPATH_VIDEO_IMG = '/html/head/meta[@property="og:image"]/@content';
	var video_info = [];
	var xp_res_player = cw.document.evaluate(XPATH_PLAYER, cw.document, null, cw.XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

	while (player = xp_res_player.iterateNext()) {
	    var player_doc = player.contentDocument;

       	    var video_uri = player_doc.evaluate(XPATH_VIDEO_URI, player_doc, null, cw.XPathResult.STRING_TYPE, null).stringValue;
	    var video_img = player_doc.evaluate(XPATH_VIDEO_IMG, player_doc, null, cw.XPathResult.STRING_TYPE, null).stringValue;

	    if(!video_uri)continue;
	    
	    video_info.push({
		'player':player,
		'video_img':video_img,
		'videos': [ {'quality':'medium', 'url':video_uri} ]
	    });
	}
	return video_info;
    }
};
