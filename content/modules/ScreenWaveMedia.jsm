var parser = {
    parse_embed: function(cw) {
        var player;
        var videos = [];
        var video_info = [];
        const doc = cw.document;

        //src of the script tag to search
        const URL_PLAYER_SCRIPT = 'http://player2.screenwavemedia.com/player.php';

        //XPATH of the script tag
        const XPATH_PLAYER_SCRIPT = "//script[starts-with(@src, '"+URL_PLAYER_SCRIPT+"')]";

        //get the SWM script node
        var script_res = doc.evaluate(XPATH_PLAYER_SCRIPT, doc, null,
                                      cw.XPathResult.FIRST_ORDERED_NODE_TYPE,
                                      null);

        var script_node = script_res.singleNodeValue;
        if(!script_node)return;

        //get the player location
        //var player = doc.getElementById('SWMPlayer-'+video_id+'-container');
        var player = script_node.parentNode;

        //regex to find the Screen Wave Media Server address
        const REGEX_SWM_ADDR = 'var SWMServer = "(.*)";';
        
        //search the SWM_Server ip address
        var script_content = utils.get(script_node.src);        
        const SWM_ADDR = script_content.match(REGEX_SWM_ADDR)[1];
        
        //hard coded known video quality
        const video_quality = ['high', 'hd1'];

        //the direct link to the image and videos VIDEO_ID is to be replaced
        //by the actual video id and QUALITY is to be replaced by the each
        //elements in the video_quality array
        const URL_VIDEO = 'http://'+SWM_ADDR+'/vod/VIDEO_ID_QUALITY.mp4';
        const URL_IMAGE = 'http://image.screenwavemedia.com/VIDEO_ID_thumb_640x360.jpg';
        
        //get the video id from the script src value
        const REGEX_ID = 'id=(.*)';
        var video_id = script_node.src.match(REGEX_ID)[1];

        //replace VIDEO_ID and QUALITY with actual values
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
