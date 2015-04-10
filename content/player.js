vwofPlayer = {
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
       callback function called when the video selector is clicked
       replace the video selector with a video 
    */
    video_selector_click:function(event){
	const doc = event.originalTarget.ownerDocument;

	//get the currently selected video link from the video selector
        //the open in a new tab link is the direct link to the video
	var l=doc.getElementById('vwof_link_new_tab_'+this.id);
	var url = l.href;

	//create the video element
	var node_playback = doc.createElement('video');
	node_playback.setAttribute('height', '100%');
	node_playback.setAttribute('width', '100%');
	node_playback.setAttribute('controls', 'controls');

	var node_source = doc.createElement('source');
	node_source.setAttribute('src', url);
	node_playback.appendChild(node_source);	    

	//replace the video selector with the playback node
	var video_selector_parent = this.parentNode;
	video_selector_parent.replaceChild(node_playback, this);
    },
    /**
       Create the html code which embed the video selector in the document
    */
    create_video_selector:function(video_info, cw){
	//set the player size depending on the location where embed it
	var cstyle = cw.getComputedStyle(video_info['player']);
	var doc = cw.document;

	var h = cstyle.getPropertyValue("height");
	var w = cstyle.getPropertyValue("width");
	if(w == "0px")w="90vw";
	if(h == "0px")h="90vh";

        var player_style_size = 'min-width:'+w+';min-height:'+h+';';
	var player_style_image = '';
	video_selector_id = 'vwof_' + Math.floor((Math.random() * 99));

	//add the player css if necessary
	const style_id = 'vowf_player_style';
	if(!doc.getElementById(style_id)){
	    this.add_style(doc, style_id);
	}
	
	//Create the 'video selector' (a div with detected videos links)
	var video_selector = doc.createElement('div');
	video_selector.setAttribute('class', 'vwof_player');
	
	//identify this video selector if the original element did not have an id
	if(!video_selector.id)video_selector.setAttribute('id', video_selector_id);
	
	//thumbnail
	if(img = video_info['video_img']){
	    player_style_image = 'background-image:url('+img+');';
	}

	//vwof icon
	var node_image = doc.createElement('img');
	node_image.setAttribute('src', 'chrome://vwof/skin/video-icon.png');
	video_selector.appendChild(node_image);

	//select video format and quality
	var prefered_index = 0;
	
	//if only one video format/quality for this video is detected, do not
	//display the selectbox but text with the format/quality
	if(video_info.videos.length == 1){
	    var node_span = doc.createElement('span');
	    node_span.setAttribute('class', 'vwof_video_info');
	    var format = video_info.videos[0].format ? video_info.videos[0].format : '';
	    var quality = video_info.videos[0].quality ? video_info.videos[0].quality : '';
	    var node_info = doc.createTextNode(format + ' ' + quality);
	    
	    node_span.appendChild(node_info);
	    video_selector.appendChild(node_span);
	}
	else{
	    //several format/quality detected for this video
	    prefered_index = this.find_prefered_video(video_info.videos);

	    //creates a select node to display and select all available quality
	    var node_select = doc.createElement('select');
	    node_select.setAttribute('id', 'vwof_select_video_'+ video_selector_id);
	    node_select.setAttribute('class', 'vwof_video_info');
	    node_select.addEventListener('click', function(event){
		event.stopPropagation();
	    });

	    //add the options to the selectbox
	    for(var i=0;i<video_info.videos.length;i++){
                var url = video_info.videos[i].url;

		var node_option = doc.createElement('option');
		node_option.setAttribute('value', url);
		
		var format = video_info.videos[i].format ? video_info.videos[i].format : '';
		var quality = video_info.videos[i].quality ? video_info.videos[i].quality : '';
		var node_option_content = doc.createTextNode(format + ' ' + quality);

		if(i == prefered_index){
		    node_option.setAttribute('selected', 'true');
		}

		node_option.appendChild(node_option_content);
		node_select.appendChild(node_option);
	    }

	    //add the select to the video selector
	    video_selector.appendChild(node_select);
	    
	    //update the open in a new tab link when the selectbox index changes
	    node_select.addEventListener('change', function(event){
		var doc = this.ownerDocument;
		var link = doc.getElementById('vwof_link_new_tab_'+video_selector_id);
		link.setAttribute('href', this.options[this.selectedIndex].value);
	    });
	    
	}

	//callback function when the video selector is clicked
	//replace the video selector by the actual video to be played
	video_selector.addEventListener('click', this.video_selector_click);
	
	//open in a new tab link
	var node_link_new_tab = doc.createElement('a');
	node_link_new_tab.setAttribute('id', 'vwof_link_new_tab_'+video_selector_id);
	node_link_new_tab.addEventListener('click', function(event){
	    event.stopPropagation();
	});
	node_link_new_tab.setAttribute('href', video_info.videos[prefered_index].url);
	node_link_new_tab.setAttribute('target', '_blank');
	var a_content_new_tab = doc.createTextNode('Open in a new tab');
	node_link_new_tab.appendChild(a_content_new_tab);
	video_selector.appendChild(node_link_new_tab);

	//display media source
	if(video_info['source']){
	    var node_span = doc.createElement('span');
	    var node_source = doc.createTextNode('Powered by ' + video_info['source']);
	    node_span.setAttribute('style', 'bottom:1px;left:1px;');
	    node_span.appendChild(node_source);
	    video_selector.appendChild(node_span);
	}

	//apply style to the player
	video_selector.setAttribute('style', player_style_image + player_style_size);
	
	return video_selector;
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

	//match quality
	for(i=0;i<videos.length;i++){
	    if(videos[i].quality && videos[i].quality == prefered_quality){
		candidate.push(i);
	    }
	}

	//match format over quality selected cantidates
	for(i=0;i<candidate.length;i++){
	    if(videos[candidate[i]].format && videos[candidate[i]].format.match(prefered_format)){
		return candidate[i];
	    }
	}

	//return the first candidat if only one video is detected
	//if no valide candidate, return the video in the middle of the list
	var index = candidate.length > 0 ? candidate[0] : Math.floor(videos.length / 2);
	return index;
    }
};
