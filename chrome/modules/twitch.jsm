var EXPORTED_SYMBOLS = ["parser"];
var parser = {
    BASE_URI : 'www.twitch.tv',
    API_GET_VIDEO:'http://usher.twitch.tv/select/CHANNEL.json?allow_source=true&nauthsig=SIG&nauth=TOKEN&type=any',
    API_GET_TOKEN:'http://api.twitch.tv/api/channels/CHANNEL/access_token',
    
    parse_site:function(cw) {
	const REGEX_CHANNEL = /twitch.tv\/(\w+)/;
	var doc = cw.document;
	var video_info = [];
	var channel;

	//get the channel name
	if(url_match = doc.URL.match(REGEX_CHANNEL)){
	    channel = url_match[1];
	}
	else{
	    throw('cannot retreive channel name of a '+this.BASE_URI+' video on '+doc.URL);
	}

	//get sig and token
	var api_token_uri = this.API_GET_TOKEN.replace('CHANNEL', channel);
	var str_token = vwofChrome.utils.get(api_token_uri);
	var json_token = JSON.parse(str_token);
	
	var sig = json_token['sig'];
	var token = json_token['token'];
	//token = token.replace(/"/g, '\\"');
	token = encodeURIComponent(token);

	//get video info with sig and token values
	var api_video_uri = this.API_GET_VIDEO.replace('CHANNEL', channel);
	api_video_uri = api_video_uri.replace('SIG', sig);
	api_video_uri = api_video_uri.replace('TOKEN', token);

	var str_video = vwofChrome.utils.get(api_video_uri);
	alert(str_video);
	return video_info;
    }
};
