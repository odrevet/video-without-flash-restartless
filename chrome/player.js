var vwofPlayer = {
    /**
       add the player stylecheet link to the head of the document
    */    
    add_style:function(doc, style_id){
	var style = doc.createElement('link');
	style.setAttribute('type', 'text/css');
	style.setAttribute('rel', 'stylesheet');
	style.setAttribute('href', 'chrome://vwof/skin/player.css');
	style.setAttribute('id', style_id);
	doc.head.appendChild(style);
    },
    
    /**
       Create the html code to embed in the document
    */
    create_player:function(video_info, cw){
	//set the player size depending on the location where embed it
	var cstyle = cw.getComputedStyle(video_info['player']);
	var doc = cw.document;
	var h = cstyle.getPropertyValue("height");
	var w = cstyle.getPropertyValue("width");
        var player_style_size = 'min-width:'+w+';min-height:'+h+';';
	var player_style_image = '';
	var player_id = 'vwof_' + Math.floor((Math.random() * 99));

	//add the player css if necessary
	const style_id = 'vowf_player_style';
	if(!doc.getElementById(style_id)){
	    this.add_style(doc, style_id);
	}
	
	//Create the 'player' (div that call the frame with the video as src when clicked)
	var player = doc.createElement('div');
	player.setAttribute('class', 'vwof_player');
	if(!player.id)player.setAttribute('id', player_id);  //identify the div player if the original element did not have an id
	var player_onclick = "var i = document.createElement('iframe');i.setAttribute('class', 'vwof_frame');i.setAttribute('style', '"+player_style_size+"');";
	
	//thumbnail
	if(img = video_info['video_img']){
	    player_style_image = 'background-image:url('+img+');';
	}

	//vwof icon
	var node_image = doc.createElement('img');
	node_image.setAttribute('src', 'chrome://vwof/skin/video-icon.png');
	player.appendChild(node_image);

	//select video format and quality
	var prefered_index = 0;
	
	//if the number of video found for this player is only one, do not display the select and append a simple text
	if(video_info.videos.length == 1){
	    player_onclick += "i.setAttribute('src', '"+video_info.videos[prefered_index].url+"');";
	    var node_span = doc.createElement('span');
	    node_span.setAttribute('class', 'vwof_video_info');
	    var format = video_info.videos[0].format ? video_info.videos[0].format : '';
	    var quality = video_info.videos[0].quality ? video_info.videos[0].quality : '';
	    var node_info = doc.createTextNode(format + ' ' + quality);
	    
	    node_span.appendChild(node_info);
	    player.appendChild(node_span);
	}
	else{
	    prefered_index = this.find_prefered_video(video_info.videos);

	    player_onclick += "e=document.getElementById('vwof_select_video_"+player_id+"');i.setAttribute('src', e.options[e.selectedIndex].value);";
	    
	    var node_select = doc.createElement('select');
	    node_select.setAttribute('id', 'vwof_select_video_'+ player_id);
	    node_select.setAttribute('class', 'vwof_video_info');
	    node_select.setAttribute('onclick', "event.stopPropagation();");
	    node_select.setAttribute('onchange', 'document.getElementById(\'vwof_link_new_tab_'+player_id+'\').href=this.options[this.selectedIndex].value');
	    
	    for(var i=0;i<video_info.videos.length;i++){
		var node_option = doc.createElement('option');
		node_option.setAttribute('value', video_info.videos[i].url);
		
		var format = video_info.videos[i].format ? video_info.videos[i].format : '';
		var quality = video_info.videos[i].quality ? video_info.videos[i].quality : '';
		var node_option_content = doc.createTextNode(format + ' ' + quality);

		if(i == prefered_index){
		    node_option.setAttribute('selected', 'true');
		}
		
		node_option.appendChild(node_option_content);
		node_select.appendChild(node_option);
		player.appendChild(node_select);
	    }
	}

	player_onclick += 'var p = this.parentNode;p.replaceChild(i, this);';
	player.setAttribute('onclick', player_onclick);
	
	//open in a new tab link
	var node_link_new_tab = doc.createElement('a');
	node_link_new_tab.setAttribute('id', 'vwof_link_new_tab_'+player_id);
	node_link_new_tab.setAttribute('onclick', 'event.stopPropagation();');
	node_link_new_tab.setAttribute('href', video_info.videos[prefered_index].url);
	node_link_new_tab.setAttribute('target', '_blank');
	var a_content_new_tab = doc.createTextNode('Open in a new tab');
	node_link_new_tab.appendChild(a_content_new_tab);
	player.appendChild(node_link_new_tab);
	/*
	  var node_link_download = doc.createElement('a');
	  node_link_download.setAttribute('id', 'vwof_link_download_'+player_id);
	  node_link_download.setAttribute('onclick', 'event.stopPropagation();');
	  node_link_download.setAttribute('href', video_info.videos[prefered_index].url);
	  node_link_download.setAttribute('Download', 'test.webm');
	  var a_content_download = doc.createTextNode('Download !');
	  node_link_download.appendChild(a_content_download);
	  player.appendChild(node_link_download);

	  var button_download = doc.createElement('input');
	  button_download.setAttribute('type', 'button');
	  button_download.setAttribute('value', 'Download');	    
	  button_download.setAttribute('onclick', "event.stopPropagation();document.location = 'data:Application/octet-stream,"+encodeURIComponent(video_info.videos[prefered_index].url)+"'");
	  player.appendChild(button_download);
	*/
	//display media source
	if(video_info['source']){
	    var node_span = doc.createElement('span');
	    var node_source = doc.createTextNode('Powered by ' + video_info['source']);
	    node_span.setAttribute('style', 'bottom:1px;left:1px;');
	    node_span.appendChild(node_source);
	    player.appendChild(node_span);
	}

	//apply style to the player
	player.setAttribute('style', player_style_image + player_style_size);
	
	return player;
    },

    /**
       returns the index of the video which the format and quality matches most the preference settings
    */
    find_prefered_video: function(videos){
	var candidate = [];
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var prefered_format = prefManager.getCharPref("extensions.vwof.prefered_format");
	var prefered_quality = prefManager.getCharPref("extensions.vwof.prefered_quality");
	var i;

	if(prefered_quality){
	    //match quality
	    for(i=0;i<videos.length;i++){
		if(videos[i].quality && videos[i].quality == prefered_quality){
		    candidate.push(i);
		}
	    }
	}

	if(prefered_format){
	    //match format over quality selected cantidates
	    for(i=0;i<candidate.length;i++){
		if(videos[candidate[i]].format && videos[candidate[i]].format.match(prefered_format)){
		    return candidate[i];
		}
	    }
	}

	//return the first candidat, or if no candidate the video in the middle of the list
	var index = candidate.length > 0 ? candidate[0] : Math.floor(videos.length / 2);
	return index;
    }
};
