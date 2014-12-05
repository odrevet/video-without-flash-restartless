var parser = {
    BASE_URI: 'www.nicovideo.jp',

    parse_site: function(cw) {
	const doc = cw.document;
	var video_info = [];
	var player = doc.getElementById('nicoplayerContainer');	

	//remove the 'limited functionality' alert warning
	const XPATH_CHECK_FLASH = '/html/body/script[67]';
	var node_script_check_flash = doc.evaluate(XPATH_CHECK_FLASH,
						   doc, null,
						   cw.XPathResult.FIRST_ORDERED_NODE_TYPE,
						   null).singleNodeValue;
	if(node_script_check_flash)node_script_check_flash.textContent = '';

	//auto redirect to the 'skip flash install' page
	if(new RegExp(/\/watch\/sm\d+$/).test(cw.location.href)){
	    cw.location.assign(cw.location.href+'?ver=q9');
	}
	
	////get some video information  (thumbnail, video id, etc)
	//the script content contains a json string with informations
	const XPATH_SCRIPT = '/html/body/script';
	var script_content = doc.evaluate(XPATH_SCRIPT, doc,
					  null, cw.XPathResult.STRING_TYPE,
					  null).stringValue;

	//extract the json formated part of the script content
	var string_data = script_content.match(/window.watchAPIData = (.*);/)[1];    
	var json_data = JSON.parse(string_data);
	
	////get the video link from the flapi
	const video_id = json_data.flashvars.videoId;
	const flapi_url = 'http://flapi.nicovideo.jp/api/getflv?v='+video_id;
	const data = utils.get(flapi_url);
	const assoc_data = utils.url_vars_to_array(data);
	const url = decodeURIComponent(assoc_data['url']);
	
	var videos = [ {
	    'quality':'medium',
	    'url': url
	} ];
	
	video_info.push({
	    'player': player,
	    'video_img': json_data.videoDetail.thumbnail,
	    'videos': videos
	});
	
	return video_info;
    }
};
