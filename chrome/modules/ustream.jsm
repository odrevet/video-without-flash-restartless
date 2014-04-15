/**
   ustream parser
   inspired from https://github.com/piscui/ustream-to-ffmpeg
*/

var parser = {
    BASE_URI:'www.ustream.tv',
    
    parse_site : function(cw){
	const XPATH_CHANNEL_ID = '/html/head/meta[@name="ustream:channel_id"]/@content';
	const XPATH_VIDEO_IMG = '/html/head/meta[@property="og:image"]/@content';
	const URL_AMF = 'http://cgw.ustream.tv/Viewer/getStream/1/CHANNEL_ID.amf';

	var video_info = [];
	
       	var channel_id = cw.document.evaluate(XPATH_CHANNEL_ID, cw.document, null, cw.XPathResult.STRING_TYPE, null).stringValue;
	var video_img = cw.document.evaluate(XPATH_VIDEO_IMG, cw.document, null, cw.XPathResult.STRING_TYPE, null).stringValue;
	var video_uri = URL_AMF.replace('CHANNEL_ID', channel_id);

	var data = utils.get(video_uri);
	var videos = this.parse_data(data);
	
	var player = cw.document.getElementsByClassName("player")[0];

	video_info.push({
	    'player':player,
	    'video_img':video_img,
	    'videos': videos
	});


	return video_info;
    },

    parse_data : function(data){
	//const REGEX_CDNURL = /cdnUrl\W\W\S(.+?)\x00/;
	const REGEX_LIVEHTTP = /liveHttpUrl\W\W\S(.+?)\x00/;	

	//var url_rtmp = data.match(REGEX_CDNURL)[1];
	var url_http = data.match(REGEX_LIVEHTTP)[1];

	var videos = [];       
	//videos.push({'format': 'rtmp', 'url': url_rtmp });
	videos.push({'format': 'm3u8', 'url': url_http });

	return videos;
    }
};
