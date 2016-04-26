/*
* TeleStax, Open Source Cloud Communications
* Copyright 2011-2016, Telestax Inc and individual contributors
* by the @authors tag.
*
* This program is free software: you can redistribute it and/or modify
* under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation; either version 3 of
* the License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>
*/

var contact = "";
var video_flag;

var spanWrtcConfiguration = {
	communicationMode : 'SIP',
	sip : {
		sipUserAgent : 'TelScale RTM Olympus/1.0.0',
		sipRegisterMode : true,
		sipOutboundProxy : '',
		sipDomain : '',
		sipDisplayName : '',
		sipUserName : '',
		sipLogin : '',
		sipPassword : ''
	},
	RTCPeerConnection : {
		iceServers : '',
		stunServer : 'stun.l.google.com:19302',
		turnServer : '',
		turnLogin : '',
		turnPassword : ''
	}
};

var spanCallConfiguration = {
	audioCodecsFilter : '',
	audioMediaFlag : true,
	displayName : '',
	localMediaStream : '',
	videoCodecsFilter : "",
	videoMediaFlag : true,
	messageMediaFlag : true
};
var chatObject = {
	id : "",
	status : "normal",
	writeText : ""
};

var inCommingCallConfiguration = {
	displayName : contact,
	localMediaStream : '',
	audioMediaFlag : true,
	videoMediaFlag : true,
	messageMediaFlag : true

};

navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia
		|| navigator.mozGetUserMedia || navigator.msGetUserMedia);

var g_spanWrtcClient;
var g_spanLocalStream;
var g_incommingCall;
var g_username;
var g_contact;
var g_pwd;
var g_domain;
var g_port;

function signIn() {
	g_username = $("#username").val();
	g_pwd = $("#password").val();
	g_domain = $("#domain").val();
	g_port = $("#port").val();
	sessionStorage.setItem('username', g_username);
	sessionStorage.setItem('password', g_username);
	spanThemeLogin();
}

function spanThemeLogin() {
	console.log(" username " + g_username);
	var proxy_str = "wss://" + g_domain + ":" + g_port;

	spanWrtcConfiguration.sip.sipUserName = g_username;
	spanWrtcConfiguration.sip.sipLogin = g_username;
	spanWrtcConfiguration.sip.sipDisplayName = g_username;
	spanWrtcConfiguration.sip.sipDomain = g_domain;
	spanWrtcConfiguration.sip.sipPassword = g_pwd;
	spanWrtcConfiguration.sip.sipOutboundProxy = proxy_str;

	if (g_username == "jack") {
		g_contact = "smith";
	} else if (g_username == "smith") {
		g_contact = "jack";
	} else if (g_username == "alice") {
		g_contact = "test";
	} else if (g_username == "test") {
		g_contact = "alice";
	} else {
		alert("Invalid Username :Enter the username or password!!");
		$("#loginPage").show();
		$("#agentMainScreen").hide();
		return;
	}
	$("#loginPage").hide();
	$("#agentMainScreen").show();
	if(g_username == 'alice' || g_username == 'smith'){
		removejscssfile("js/together_canvas.js","js");
		loadjscssfile("js/together_canvas.js","js");
	}
	spanWebrtcEventListner = new WebRTCommCallEventListenerInterface();

	spanWebrtcEventListner.onWebRTCommClientOpenedEvent = function() {
		console.log("onWebRTCommClientOpenedEvent");
	};

	spanWebrtcEventListner.onWebRTCommClientOpenErrorEvent = function(error) {

	};

	spanWebrtcEventListner.onWebRTCommClientClosedEvent = function() {
		console.log('// TODO: this.onClickStopVideoStreamButtonViewEventHandler();');
	};

	spanWebrtcEventListner.onGetUserMediaErrorEventHandler = function(error) {
		console.debug('MobicentsWebRTCPhoneController:onGetUserMediaErrorEventHandler(): error='
						+ error);
		console.log('Failed to get local user media: error=' + error);
	};

	/* == Call related listeners ============================================== */

	spanWebrtcEventListner.onWebRTCommCallRingingEvent = function(webRTCommCall) {
		console.log("onWebRTCommCallRingingEvent");
		currentCall = webRTCommCall;

		g_incommingCall = webRTCommCall;
		currentcCall = webRTCommCall;
		var str = "Incomming Call from " + g_contact;
		createModal("VideoCall", str);
		if(document.getElementById("slideContentId")){
			document.getElementById("slideContentId").style.display = "block";
	}
	};

	spanWebrtcEventListner.onWebRTCommCallInProgressEvent = function(
			webRTCommCall) {
		console.log('call in progress...');
	};

	spanWebrtcEventListner.onWebRTCommCallRingingBackEvent = function(
			webRTCommCall) {
		currentCall = webRTCommCall;
		console.log('ringing back...');
	};

	spanWebrtcEventListner.onWebRTCommCallOpenErrorEvent = function(
			webRTCommCall, error) {
		console.log("onWebRTCommCallOpenErrorEvent");
	};

	spanWebrtcEventListner.onWebRTCommCallClosedEvent = function(webRTCommCall) {
		console.log("onWebRTCommCallClosedEvent");
		var videoElem = document.getElementById('remoteVideo');
		videoElem.src = "";
		/*------ for local video -----*/
	/*	currentCall = webRTCommCall;
		currentCall.close();
		var local_video=document.getElementById('localVideo');
		local_video.src="";*/
		/* ------------------------*/
		$("#agent1").show();
		$("#agent2").hide();
		$("#call_info").show();
	};

	spanWebrtcEventListner.onWebRTCommCallOpenedEvent = function(webRTCommCall) {
		console.log("onWebRTCommCallOpenedEvent------");
		currentCall = webRTCommCall;
		var videoElem = document.getElementById('remoteVideo');
		videoElem.src = URL.createObjectURL(webRTCommCall
				.getRemoteBundledAudioVideoMediaStream()
				|| webRTCommCall.getRemoteVideoMediaStream()
				|| webRTCommCall.getRemoteAudioMediaStream());

		videoElem.muted = true;
		videoElem.play();
		document.getElementById('video-options').style.display = "block";
	};

	spanWebrtcEventListner.onWebRTCommCallHangupEvent = function(webRTCommCall) {

		console.log("onWebRTCommCallHangupEvent");
		currentCall = webRTCommCall;
		currentCall.close();
		/*------ for local video -----*/
		/*var local_video=document.getElementById('localVideo');
		local_video.src="";*/
		/* ------------------------*/
	};

	/* == End of Call related listeners ======================================= */

	/* == Messages related listeners ========================================== */

	spanWebrtcEventListner.onWebRTCommMessageReceivedEvent = function(message) {
		console.log(message);
		console.log("onWebRTCommMessageReceivedEvent");

		$("#chat_popup").click();
		responseMessage(message.from, message.text);

	};

	spanWebrtcEventListner.onWebRTCommMessageSentEvent = function(message) {
		console.log("onWebRTCommMessageSentEvent: " + message.text);
	};

	spanWebrtcEventListner.onWebRTCommMessageSendErrorEvent = function(message,
			error) {
		console.log("onWebRTCommMessageSendErrorEvent: " + message.content);
	};

	spanWebrtcEventListner.onWebRTCommDataMessageReceivedEvent = function(
			message) {
		console.log("onWebRTCommDataMessageReceivedEvent: " + message.content);
		var jsonresp=JSON.parse(message.content);
		console.log("onWebRTCommDataMessageReceivedEvent: " + jsonresp.type);
		if(jsonresp.type == "reqCoBrowsingAccess"){
			getCoBrowsingAccess();
			
		}else if(jsonresp.type == "releaseCoBrowsingAccess"){
			isURLSent = false;
			console.log("recivied datachannel message - releaseCoBrowsingAccess");
			updateCoBrowserLink(false);
			stopTogetherJS();
		}else if(jsonresp.type == 'url'){
			var peerBrowser=document.getElementById('peerBrowser');
			console.log("Current PeerBrowser src -> " + peerBrowser.src);
			if(peerBrowser && peerBrowser.src.indexOf("blank") > -1){
				console.log("Loading customer page in iFrame... share link -> " + jsonresp.content);
				var togetherId = jsonresp.content.replace(/^#/, "");
				var sessionId = /&?togetherjs=([^&]*)/.exec(togetherId);
				togetherJSSessionId = sessionId[1];
				peerBrowser.src=jsonresp.content;
				sessionStorage.setItem("isCoBrowsingEnabled",true);
				sessionStorage.setItem("coBrowsingUrl",jsonresp.content);
				$('.expand-icon').trigger('click');
				updateCoBrowserLink(true);
			}
		}else if (jsonresp.type == "updateCanvas") {
			console.log("Received message to update the Canvas. isEnabled ? " + jsonresp.canvasEnabled);
			sessionStorage.setItem("isCanvasEnabled", jsonresp.canvasEnabled);
			updateCanvasUI(jsonresp.canvasEnabled);				
		}else if (jsonresp.type == "updateCanvas_agent") {
			console.log("updateCanvas_agent ? " );
			//canvasWidthFix();
		}
		else if (jsonresp.type == "clearCanvas") {
			clearCanvasUI();
		}else if(jsonresp.type == "stopedTogetherJs"){
			isURLSent = false;
			updateCoBrowserLink(false);
			stopTogetherJS();
			document.getElementById("peerBrowser").src = "blank.htm";
		}else{
		onNewScreenContent(message);
		}
		
	}

	spanWebrtcEventListner.onWebRTCommDataMessageSentEvent = function(message) {
		console.log("onWebRTCommDataMessageSentEvent: " + message.content);
		
	}

	spanWebrtcEventListner.onWebRTCommDataMessageSendErrorEvent = function(
			message) {
		console.log("onWebRTCommDataMessageSendErrorEvent: " + message.content);
	}

	spanWebrtcEventListner.onWebRTCommDataMessageChannelOnOpenEvent = function() {
		console.log("onWebRTCommDataMessageChannelOnOpenEvent");
	}

	spanWebrtcEventListner.onWebRTCommDataMessageChannelOnCloseEvent = function() {
		console.log("onWebRTCommDataMessageChannelOnCloseEvent");
	}

	spanWebrtcEventListner.onWebRTCommDataMessageChannelOnErrorEvent = function() {
		console.log("onWebRTCommDataMessageChannelOnErrorEvent");
	}

	g_spanWrtcClient = new WebRTCommClient(spanWebrtcEventListner);
	g_spanWrtcClient.open(spanWrtcConfiguration);

}

function setSpanCallConfig(username, video) {

	contact = username;
	video_flag = video;

}
function spanCall(video) {

	setSpanCallConfig(g_contact, video);
	var mediaConstraint = {
		video : video,
		audio : true
	};

	navigator.getMedia(mediaConstraint, onSuccess, onFailure);
	callInitiator = true;
}

function onFailure() {
	console.log("onFailure");
}

function onSuccess(stream) {
	console.log(" call OnSuccess");
	spanCallConfiguration.videoMediaFlag = video_flag;
	spanCallConfiguration.localMediaStream = stream;
	/*------ For Local video uncomment following -----*/
	
  /* var videoElem = document.getElementById('localVideo');
	 

     // Firefox supports a src object
     if (navigator.mozGetUserMedia) {
       videoElem.mozSrcObject = stream;
     } else {
       var vendorURL = window.URL || window.webkitURL;
       videoElem.src = vendorURL.createObjectURL(stream);
     }

     // Start playing the video to show the stream from the webcam 
     videoElem.muted = true;
     videoElem.play();*/
	/* ------------------------*/

	currentCall = g_spanWrtcClient.call(contact, spanCallConfiguration);

}

function acceptCall(inCommingCall) {
	currentCall = inCommingCall;
	setSpanCallConfig(g_contact, true);
	var mediaConstraint = {
		video : true,
		audio : true
	};
	navigator.getMedia(mediaConstraint, inCommingOnSuccess, inCommingOnFailure);
}

function inCommingOnSuccess(stream) {

	console.log("inCommingOnSuccess");
	
	/*------ for local video uncomment following -----*/
	/*var videoElem = document.getElementById('localVideo');

    // Firefox supports a src object
    if (navigator.mozGetUserMedia) {
      videoElem.mozSrcObject = stream;
    } else {
      var vendorURL = window.URL || window.webkitURL;
      videoElem.src = vendorURL.createObjectURL(stream);
    }

    //Start playing the video to show the stream from the webcam 
    videoElem.muted = true;
    videoElem.play();*/
	/* ------------------------*/

	inCommingCallConfiguration.localMediaStream = stream;

	g_incommingCall.accept(inCommingCallConfiguration);
	$("#agent1").hide();
	$("#agent2").show();
	$("#call_info").hide();

}

function inCommingOnFailure() {
	console.log("inCommingOnFailure");
}

function sendMessage() {

	var ac = chatObject;
	ac.id = g_contact + "@telestax.com";
	console.log(" sending msg to " + ac.id);
	ac.writeText = $("#status_message").val();

	if (false && currentCall
			&& currentCall.peerConnectionState === 'established') {
		// FIXME: Check if the connection is to the contact
		currentCall.sendMessage(ac.writeText);
	} else {
		g_spanWrtcClient.sendMessage(ac.id, ac.writeText);
	}
	var class_value = "direct-chat-name pull-left";
	chatMessage(g_username, $("#status_message").val());
	$("#status_message").val("");
}

function sendDataMessage(text) {
	currentCall.sendDataMessage(text);
}
function sendDataMessageParent(text) {
	parent.currentCall.sendDataMessage(text);
}
function callHangUp() {
	currentCall.close();
	currentCall = undefined;
	
}
var string, mainstring;
function createModal(s1, s2) {
	$("#myModalLabel").text(s1);
	$("#alert_content").text(s2);
	// Show the Modal on load
	mainstring = s1;
	$("#myModal").modal("show");

}
function accept_inCall() {

	acceptCall(g_incommingCall);
	if(g_username.indexOf('test') < 0 || g_username.indexOf('jack') < 0){
		callInitiator = true;
	}
	$("#myModal").modal("hide");
	if(document.getElementById("clickme")){ 
		document.getElementById("clickme").style.display = "block";
	}
	
		
}

function reject_inCall() {
	g_incommingCall.reject();
	$("#myModal").modal("hide");
}

function chatMessage(contact, msg) {
	var currentDateTime = new Date();
	var appendDiv = "<div class='direct-chat-messages'><div class='direct-chat-msg doted-border'><div class='direct-chat-info clearfix'><span class='direct-chat-name pull-left'>"
			+ contact
			+ "</span></div><img alt='message user image' src='images/profile-icon.png' class='direct-chat-img'><div class='direct-chat-text' id='chatMessage'>"
			+ msg
			+ "</div><div class='direct-chat-info clearfix'><span class='direct-chat-timestamp pull-right'>"
			+ currentDateTime.getHours()
			+ ":"
			+ currentDateTime.getMinutes()
			+ "</span></div></div></div>";
	$(".popup-messages").append($(appendDiv));
}
function responseMessage(contact, msg) {
	var currentDateTime = new Date();
	var appendDiv = "<div class='direct-chat-messages'><div class='direct-chat-msg doted-border'><div class='direct-chat-info clearfix'><span class='reply-chat-name pull-right'>"
			+ contact
			+ "</span></div><div class='pull-right'><img alt='message user image' src='images/profile-icon1.png' class='direct-chat-img'></div><div class='reply-chat-text' id='chatMessage'>"
			+ msg
			+ "</div><div class='direct-chat-info clearfix'><span class='direct-chat-timestamp pull-left'>"
			+ currentDateTime.getHours()
			+ ":"
			+ currentDateTime.getMinutes()
			+ "</span></div></div></div>";
	$(".popup-messages").append($(appendDiv));
}

function chat_pop() {
	$('#qnimate').addClass('popup-box-on');
	$("#chat_headername").text(g_username);

}
function hide_popup() {
	$('#qnimate').removeClass('popup-box-on');

}


function loadjscssfile(filename, filetype){
	
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
    	if(g_username=='alice'|| g_username == 'smith')
        document.getElementsByTagName("head")[0].appendChild(fileref);
    	else{
    		document.getElementById("peerBrowser").contentDocument.getElementsByTagName("head")[0].appendChild(fileref);
    		
    	}
}


function removejscssfile(filename, filetype){
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
    if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
        allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
    }
}

function logout() {
	isLogOutClicked = true;
	stopTogetherJS();
	sessionStorage.removeItem("username");
	sessionStorage.removeItem("password");
	sessionStorage.removeItem("isCanvasEnabled");
	sessionStorage.removeItem("togetherjs-session.status");
	sessionStorage.removeItem("togetherjs-session.peerCache");
	window.location.reload();
	
	console.log('Session Cleared and closed');
}

function agentLogout() {
	isLogOutClicked = true;
	// TODO Clear Media resouces if Call exists
	stopTogetherJS();
	sessionStorage.removeItem("sessionId");
	sessionStorage.removeItem("coBrowsingUrl");
	sessionStorage.removeItem("isCanvasEnabled");
	sessionStorage.removeItem("isCoBrowsingEnabled");
	sessionStorage.removeItem("togetherjs-session.status");
	sessionStorage.removeItem("username");
	sessionStorage.removeItem("password");
	sessionStorage.removeItem("togetherjs-session.peerCache");
	window.location.reload();
	console.log('Session Cleared and closed');
}