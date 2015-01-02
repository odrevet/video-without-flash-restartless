video-without-flash
===================

Firefox extension for watching videos without the flash plugin


Fetch video source of flash based media and play the video directly with Firefox, without the use of the flash plug-in.

**Supported sites/embed video player**
* Youtube (partial support)
* Blip
* ScreenWaveMedia
* HTML5
* Dailymotion
* FC2
* niconico

Due to some minor variations of providing the video by a same media provider (different version of there player, use of the embed tag) a few videos may not be detected. 

** Usage **
By default the video are detected when a page load, you can disable this behavior in the preference pane and manually try to detect video by pressing ALT-w. 

**Why you  may want to use this extension**
* You experienced some lag or bad CPU performance using flash
* You only use flash to watch videos, and do not want to install a non-free packages on your linux station (this extension is released under the GPL)

<b> Pro tips </b>
*To read MP4 videos you must install a media plugin like vlc-web-plugin or gecko-mplayer. Under Windows the vlc web plugin can be install when running the vlc install exe. 

* The video can be save with a "right click / save as" on the "open in a new tab"  link.

* Numerous options in the preference pane : select preferred format / quality when available, disable modules. 

**Known bugs**
(unfortunately these are upstream bugs, nothing I can do about it)

* YouTube : The video area is not reloading when clicking on a suggested video link. After clicking on such a link, and no ALT-w command.

**How does it works**
This extension fetch the direct link to videos using regular expression, XPath, and DOM. When available,  a picture and a select control are displayed to read the video with firefox, using the firefox internal HTML5 compliant media player or a plugin like vlc or mplayer if the user had installed it. 

Each media provider is handled by a "parser". Javascript modules (.jsm) that are loaded at startup. The extension can fairly easy be extended due to it modular approache, as new media provider can be added by implementing a new jsm file. 

**Why a HTML5 parser ?**
For licensing reasons firefox did not support the H264 codec. 
By using the HTML5 parser, you can read the video if a media player plugin is installed as stated previously.

= Technical documentation for developers =

== How to write a new parser == 

Do not esitate to fork and add your own parser

* Step 1 : Add the name of your parser without the .jsm extension in the browser variable "extensions.vwof.modules" you can do it with about:config for test purposes or do it permanently in src/defaults/preferenes/vwof.js
The boolean value (parsername:1) is eather if your parser is activated or not. 


* Step 2 : Create a jsm file in the modules directory

The parser must respect the following API  : 

```javascript
var parser = {
    BASE_URI: '',
    parse_embed: function(cw) {
        var video_info = [];
	return video_info;
    },

    parse_site: function(cw) {
	var video_info = [];
	var player = cw.document.getElementById('');
	if(!player)return;

	return video_info;
    }
};
```

=== video_info variable ===

video player is an array of an hash

each video is an entry in the array and the hash contains video information

If the videos array contains more than one element a combo box (select tag)
will be added in the player displaying the format and quality

```javascript
video_info = 
[
{
'player':,              //DOM where the video player will be embed, replacing all child nodes, if undefined, the video open in a new tab

'video_img':,           //string link to the picture displayed as a preview, if undefined the background is black

'videos': []            //array of video informations, see below
}
];

videos = 
[
{
'quality':,              //quality of the video (low, medium, hd720, hd1080)

'format':,               //format of the video (webm, mp4, flv, ...)

'url':                   //direct link to the video, this is the only mandatory variable
}
];