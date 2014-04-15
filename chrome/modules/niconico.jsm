var parser = {
    BASE_URI: 'www.nicovideo.jp',

    parse_site: function(cw) {
	var video_info = [];
	var player = cw.document.getElementById('nicoplayerContainer');	

	//remove the 'limited functionality' alert warning
	const XPATH_CHECK_FLASH = '/html/body/script[67]';
	var node_script_check_flash = cw.document.evaluate(XPATH_CHECK_FLASH,
							   cw.document, null,
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
	var script_content = cw.document.evaluate(XPATH_SCRIPT, cw.document,
						  null, cw.XPathResult.STRING_TYPE,
						  null).stringValue;

	//extract the json formated part of the script content
	var string_data = script_content.match(/window.watchAPIData = (.*);/)[1];    
	var json_data = JSON.parse(string_data);
	
	////get the video link from the flapi
	var video_id = json_data.flashvars.videoId;
	var flapi_url = 'http://flapi.nicovideo.jp/api/getflv?v='+video_id;
	var data = utils.get(flapi_url);
	var assoc_data = utils.url_vars_to_array(data);
	var url = decodeURIComponent(assoc_data['url']);
	
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
