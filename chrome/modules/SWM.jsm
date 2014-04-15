/**
ScreenWaveMedia module

The only site where I go that uses this media provider is cinemassacre.com

The video are all in RMTP format and there is only one format for each video

Since it is all RMTP, the link is open in a vlc instance outside of firefox, but it's no big deal as long
as the video can be played.

There are two html layout, the "old" layout (http://cinemassacre.com/2013/07/01/avgn-bill-teds-excellent-adventure/)

<div id="SWMPlayer_25823" class="SWMPlayer" style="width:640px;height:320px;">Loading Video...</div>
<script type="text/javascript" src="http://player.screenwavemedia.com/play/jwplayer/jwplayer.js"></script>
<script type="text/javascript" src="http://player.screenwavemedia.com/play/embed.php?id=25823"></script>   <-- video data are here

and the "new" layout since september 2013 (http://cinemassacre.com/2013/09/06/avgn-tiger-electronic/)

<iframe src="http://player.screenwavemedia.com/play/player.php?id=Cinemassacre-52273484b87b2" frameborder="0" height="540" width="960">
<html> ...

	<div id="SWMPlayer" class="SWMPlayer">Loading Video...</div>
	<script>
	   ...
	  jwplayer('SWMPlayer').setup({
		'id': 'videoPlayer',
		'width': '100%', 'height': '100%',
		'provider': 'rtmp',
		'streamer': 'rtmp://174.127.86.16/Cinemassacre',
		'flashplayer': 'http://player.screenwavemedia.com/play/jwplayer/player.swf',
		'file': 'Cinemassacre-52273484b87b2_high.mp4',
		'image': 'http://image.screenwavemedia.com/Cinemassacre-52273484b87b2_thumb_640x360.jpg', 'stretching': 'uniform',
	</script>  
</body></html>
</iframe>


For both layout, the video data are in the same format, only the way to get the script content differ
*/

var parser = {
    parse_embed: function(cw) {
	const REGEX_IMG = /'image': '(.*\.jpg)'/;
	var video_info = [];   //player DOM element, preview image and array of videos
	
	//for the "old" layout, outside of a frame, script tag with src
	const XPATH_PLAYER = "//div[starts-with(@id, 'SWMPlayer')]";
	const XPATH_SCRIPT = "//script[starts-with(@src, 'http://player.screenwavemedia.com/play/embed.php')]";

	var xp_res_player = cw.document.evaluate(XPATH_PLAYER, cw.document, null, cw.XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
       	var xp_res_script = cw.document.evaluate(XPATH_SCRIPT, cw.document, null, cw.XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

	while (player = xp_res_player.iterateNext()) {
	    var script = xp_res_script.iterateNext();
	    var script_content = utils.get(script.src);

	    var video_img = script_content.match(REGEX_IMG)[1];
	    var videos = this.parse_data(script_content);  //get format, type and uri of videos
	    
	    video_info.push({
		'player':player,
		'video_img':video_img,
		'videos': videos
	    });
	}

	//for the "new" layout, inside a frame, simple script markup
	const XPATH_PLAYER_FRAME = "//iframe[starts-with(@src, 'http://player.screenwavemedia.com/play/player.php')]";
	var xp_res_player_frame = cw.document.evaluate(XPATH_PLAYER_FRAME, cw.document, null, cw.XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
	
	while (player = xp_res_player_frame.iterateNext()) {
	    var script_content = player.contentDocument.body.innerHTML;

	    var video_img_match = script_content.match(REGEX_IMG);
	    if(video_img_match)video_img = video_img_match[1];
	    else video_img = undefined;
	    
	    var videos = this.parse_data(script_content);  //get format, type and uri of videos
	    
	    video_info.push({
		'player':player,
		'video_img':video_img,
		'videos': videos
	    });
	}

	return video_info;
    },

    /**
       the video data are written in a script markup
    */
    parse_data: function(data){
	const REGEX_STREAMER = /'streamer': '(.*)'/;
	const REGEX_FILE = /'file': '(.*)'/;
	
	var streamer = data.match(REGEX_STREAMER)[1];
	var file = data.match(REGEX_FILE)[1];
	var video_uri = streamer + '/' + file;

	//only one element in the array for this module
	var videos = [ {'quality':'medium', 'format':'rtmp', 'url':video_uri} ];
	return videos;
    }
};
