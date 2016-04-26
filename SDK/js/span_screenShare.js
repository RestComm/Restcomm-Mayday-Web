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

var g_Socket = null;
var g_MemberType = 1;
var g_RoomName = "";
var g_SelfName = "";
var g_FirstUsersList = true;
var g_RemotePeerConnections = new Array();
var g_RemotePeerDataChannels = new Array();
var g_TotalRemoteSessions = 0;
var g_TotalEstablishedRemoteSessions = 0;
var g_isScreenShareSetupDone = false;
var g_RemoteVideos = new Array();
var g_RemoteSessions = new Array();
var g_RemoteUsers = new Array();
var g_LocalVideo = null;
var g_LocalStream = null;
var g_ScreenShareType = 0;// 0 Video, 1 Slides
var g_SlideShareUploadFiles = null;
var g_SlideShareUploadFileIndex = 0;
var g_SlideShareUploadIdentifier = 0;
var g_PdfDocument = null;
var g_PdfPageCount = 0;
var g_PdfPageNumber = 0;
var mediaConstraints = {
	optional : [],
	mandatory : {
		OfferToReceiveAudio : true,
		OfferToReceiveVideo : true
	}
};
var img_screen_share = null;
var vid_screen_share = null;
var div_main_window = null;
var div_screen_share = null;
var context_screen_share = null;
var canvas_screen_share = null;
var folderToShare = null;
var imageArray = null;
var imageIndex = 0;
var saveFileName = 0;
var isSlideShow = false;
var remoteVideoWindowWidth = 0;
var g_btnSlideShow = null;
var g_txtPageNumber = null;
var g_btnFirstPage = null;
var g_btnPrevPage = null;
var g_btnNextPage = null;
var g_btnLastPage = null;
var g_wbOwner = null;
window.moz = !!navigator.mozGetUserMedia;
window.RTCPeerConnection = window.mozRTCPeerConnection
		|| window.webkitRTCPeerConnection;
window.RTCSessionDescription = window.mozRTCSessionDescription
		|| window.RTCSessionDescription;
window.RTCIceCandidate = window.mozRTCIceCandidate
		|| window.webkitRTCIceCandidate || window.RTCIceCandidate;
navigator.getUserMedia = navigator.mozGetUserMedia
		|| navigator.webkitGetUserMedia;
window.URL = window.webkitURL || window.URL;
window.iceServers = {
	iceServers : [ {
		url : 'stun:23.21.150.121'
	} ]
};

isVideo = false;

var callPackage;
var dataTransfer;
var sender;
var receiver;
var call;
var buddy;

var dtConfigs; 

var isPageReload = false;

// Here sample code for extHeader
var extheader =
{
	'customerKey1' : 'value1',
	'customerKey2' : 'value2',
	'MyHeader' : 'header value2'
};


function displayScreenShareControls() {
	callHandler = new wsc.CallPackage(wscSession);
	callHandler.onIncomingCall = onInComingMessage;
	dtConfigs = new Array();
	dtConfigs[0] = {
		"label" : "ChatOverDataChannel",
		"reliable" : false
	};

	callConfig = new wsc.CallConfig(null, null, dtConfigs);
	
}

function startDataSession() {
	// Store the caller and callee names.
	var target = document.getElementById("dataTarget").value;

	buddy = target;
	// Check to see if the user gave a valid input. Omitted here.

	// Create the call object.
	var call = callHandler.createCall(target, callConfig, doDCCallError);
	// Set up the call object's components.
	if (call != null) {

		// Call object is valid. Call the required event handlers.
		setEventHandlers(call);
		
		
		// Set the event handler to call when a data transfer object is created.
		call.onDataTransfer = onDataTransfer;

		// Then start the call.
		call.start();
		// Allow the user to cancel call before it is set up.
		// Disable "Start a Chat Session" button and enable "Cancel" button.
		// If user clicks Cancel, call end() for the call object.
		// Call displayInitialControls() to display the initial input fields.
	}
}

function stopDataSession() {
	call.end();
	displayInitialControls();
}

onInComingMessage = function(dTCall, remoteCallConfig) {
	// assign the event handler onDataTransfer to the call object
	
	// We need the user's response.
	// Display an interface that lets a user decline or accept a call
	icmd = "<input type='button' name='acceptDTBtn' id='acceptDTBtn' value='Accept "
			+ " Incoming Audio Call' onclick=''/><input type='button' name='declineDTBtn' id='declineDTBtn' value='Decline Incoming Audio Call' onclick=''/>"
			+ "<br><br><hr>";
	setCmd(icmd);
	dTCall.onDataTransfer = onDataTransfer;
	document.getElementById("acceptDTBtn").onclick = function() {
		dTCall.accept(remoteCallConfig,null);
	};
	document.getElementById("declineDTBtn").onclick = function() {
		// dTCall.decline(null);
		dTCall.decline(null);
	};
	setEventHandlers(dTCall);
	call = dTCall;
};

function setEventHandlers(callObj) {

	callObj.onCallStateChange = function(newState) {
		printResults("Call State - " + JSON.stringify(newState));

		if (newState.state == wsc.CALLSTATE.ESTABLISHED) {
			printResults("Data channel established");
		} else if (newState.state == wsc.CALLSTATE.ENDED
				|| newState.state == wsc.CALLSTATE.FAILED) {
			displayScreenShareControls();
		}
		// Provide controls to gracefully end the call
		callMonitor(callObj);
	};

	// call.onMediaStreamEvent = mediaStateCallback;
}

function doDCCallError(error) {
	showResults('Call error reason:' + error.reason);
}



 onDataTransfer = function(dT) {
	printResults("DataTransfer Object Initialized");
	dataTransfer = dT;
	dataTransfer.onOpen = onDCOpen;
	dataTransfer.onError = onDCError;
	dataTransfer.onClose = onDCClose;
	printResults('DataTransfer State - ' + dataTransfer.getState());
};

onDCOpen = function(){
  
	receiver = dataTransfer.getReceiver();
    if(receiver){
        receiver.onMessage = function (evt){
        	console.log("-------------Received data-----------------------");
        	onNewScreenContent(evt);
        };
    }
	
    window.div_screen_share = document.getElementById("div_screen_share"); //CHANGE ME: Specify the PDF share DIV id
	window.vid_screen_share = document.getElementById("vid_screen_share");
	window.img_screen_share = document.getElementById("img_screen_share");
	window.canvas_screen_share = document.getElementById("canvas_screen_share");
	window.g_btnSlideShow = document.getElementById('slideshow_button_id');
	window.g_txtPageNumber = document.getElementById('slide_number');
	window.g_txtPageNumber.onkeypress=listenForSlideNumberEnter;
	window.g_btnFirstPage = document.getElementById('first_button_id');
	window.g_btnPrevPage = document.getElementById('prev_button_id');
	window.g_btnNextPage = document.getElementById('next_button_id');
	window.g_btnLastPage = document.getElementById('last_button_id');
	slideShowControls(false);
	window.context_screen_share = window.canvas_screen_share.getContext('2d');
	window.context_screen_share.fillRect(0,0,window.canvas_screen_share.width, window.canvas_screen_share.height);
	window.div_screen_share.addEventListener("drop", onContentDropped, false);
 	document.getElementById('div_screen_share').style.height = "97%";
	document.getElementById('div_screen_share').style.top = "auto";
	document.getElementById('image_share_controls').style.display = "block";
	document.getElementById('show_peerBoard').style.display = "block";	
}
function onDCError(evt) {
	printResults('DataChannel - On Error...!!!');
}

function onDCClose(evt) {
	printResults('DataChannel is closed');
}


function onContentDropped(event){
	console.log("------------Content dropped");
	event.stopPropagation();
	event.preventDefault();
	var url = event.dataTransfer.getData('URL') || event.dataTransfer.getData('TEXT');
	if(( typeof url !== 'undefined') && strEndsWith(url,'.pdf')){
		 processDroppedPdfUrl(url);
	}
	g_SlideShareUploadFiles = event.target.files || event.dataTransfer.files;
	if(( typeof g_SlideShareUploadFiles !== 'undefined' ) && ( g_SlideShareUploadFiles.length > 0 )) {
		if(g_SlideShareUploadFiles[0].type != "" && g_SlideShareUploadFiles.length == 1){ 
			if(strEndsWith(g_SlideShareUploadFiles[0].name,'.pdf')){processDroppedPdfFile(g_SlideShareUploadFiles[0]);} 
			else if((/\.(bmp|tif|jpg|jpeg|tiff|png)$/i).test(g_SlideShareUploadFiles[0].name)){ window.folderToShare = "SlideShare"+g_SlideShareUploadIdentifier++; processDroppedFolderContent(); }
//			/else if((/\.(bmp|tif|jpg|jpeg|tiff|png)$/i).test(g_SlideShareUploadFiles[0].name)){ window.folderToShare = "SlideShare"+g_SlideShareUploadIdentifier++; start_image_share(); }
			//else pf(strEndsWith(g_SlideShareUploadFiles[0].name,'.webm')){processDroppedFileContent(g_SlideShareUploadFiles[0]);}
			else { onNewAlert("Content not supported!!"); }
		}
		else if(g_SlideShareUploadFiles.length > 1){ window.folderToShare = "SlideShare"+g_SlideShareUploadIdentifier++; processDroppedFolderContent(); }
	}
	return false;
}


function screenShareFileUploader(){
	progress_window(
			true,
			false,
			'<input type="file" id="id_file_button1" name="name_file_button1" style="position:absolute; top:97%;">');
	$('#id_file_button1').click();
	$('#id_file_button1').change(function() {
		progress_window(false, false, "");
		console.log("screenshare uploaded in object");
		console.log(this.files[0]);
		processDroppedPdfFile(this.files[0]);
	});
	
}

function processDroppedPdfFile(droppedPdfFile){
	console.log("-------------processDroppedPdfFile()----");
	document.getElementById('image_share_controls').style.display = "block";
	window.img_screen_share.src='';
	PDFJS.disableWorker = true;
	var fileReader = new FileReader();
	fileReader.onload = function(evt) {PDFJS.getDocument(convertDataURIToBinary(evt.target.result)).then(onPdfLoad);};
	console.log("--------------processDroppedPdfFile() final step");
	fileReader.readAsDataURL(droppedPdfFile);
}

function onPdfLoad(pdf){
	console.log("-------------onPdfLoad()");
	if(!window.moz){
		if(isSlideShow){
			on_slideshow_click();
			setTimeout(function(){ onWaitPdfLoad(pdf); },5000);
		}else{
			onWaitPdfLoad(pdf);
		}
	}else{
		window.g_PdfDocument = pdf;
		window.g_PdfPageCount = window.g_PdfDocument.numPages;
		g_ScreenShareType = 2;
		window.canvas_screen_share.style.display = 'block';
		if(window.img_screen_share != null){try{window.div_screen_share.removeChild(window.img_screen_share);} catch(e){}}
		if(window.vid_screen_share){try{window.div_screen_share.removeChild(window.vid_screen_share);} catch(e){}}
		slideShowControls(true);
		window.g_PdfPageNumber = 0;
		on_next_click();
	}
}


function onWaitPdfLoad(pdf){
	console.log("----------onWaitPdfLoad()");
	window.g_PdfDocument = pdf;
	window.g_PdfPageCount = window.g_PdfDocument.numPages;
	g_ScreenShareType = 2;
	window.canvas_screen_share.style.display = 'block';
	window.g_PdfPageNumber = 0;
	on_next_click();
	
}


function onPdfPageLoad(page){
	console.log("-----------onPdfPageLoad()");
	window.g_txtPageNumber.value = window.g_PdfPageNumber;
	var viewport = page.getViewport(1.0);// scale value
	window.context_screen_share.canvas.height = viewport.height;
	window.context_screen_share.canvas.width = viewport.width;
	var ht= (window.context_screen_share.canvas.height - Number(200)) +"px";
	var wid= window.context_screen_share.canvas.width +"px";
	document.getElementById("share").style.width =wid;
	document.getElementById("share").style.height = ht;
	document.getElementById("share").style.overflow="scroll";
	
	var renderContext = {canvasContext: window.context_screen_share,viewport: viewport};
	page.render(renderContext).then(function(){
	var screenshotvalue = window.canvas_screen_share.toDataURL('image/webp', 1);
	if(!window.moz){
			onReadAsDataURLforChrome(true,screenshotvalue,'pdf');
	}else{
			for(var peer in g_RemotePeerDataChannels){
				try{g_RemotePeerDataChannels[peer].send(JSON.stringify({screenshot: screenshotvalue}));}
				catch (e){console.log('Exception: ' + e.message);}
			}
		}
	});
}


var BASE64_MARKER = ';base64,';
function convertDataURIToBinary(dataURI) {
	console.log("----------convertDataURIToBinary()");
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));
    for(i = 0; i < rawLength; i++) {array[i] = raw.charCodeAt(i);}
    return array;
}

function processDroppedPdfUrl(droppedPdfUrl){
	console.log("------------processDroppedPdfUrl()");
	PDFJS.disableWorker = true;
	PDFJS.getDocument(droppedPdfUrl).then(onPdfLoad);
}

function slideshow(){
	console.log("-----------Slideshow");
	if(isSlideShow && g_ScreenShareType == 1){ // image share
		if(window.imageIndex == imageArray.length-1){ window.imageIndex = -1; }
		startImageScreenShareSend(++window.imageIndex);
		if(window.imageIndex == imageArray.length-1){ window.imageIndex = -1; }
		setTimeout(slideshow, 5000);
	} else if(isSlideShow && g_ScreenShareType == 2){ // pdf share
		if(window.g_PdfPageNumber == window.g_PdfPageCount){ window.g_PdfPageNumber = 0; }
		window.g_PdfDocument.getPage(++window.g_PdfPageNumber).then(onPdfPageLoad);
		if(window.g_PdfPageNumber == window.g_PdfPageCount){ window.g_PdfPageNumber = 0; }
		setTimeout(slideshow, 5000);
	}
}

function on_slideshow_click(){
	console.log("-------on_slideshow_click");
	if(!isSlideShow) {isSlideShow = true;window.g_btnSlideShow.style.background="#33ff00";slideshow();
	} else {isSlideShow = false;window.g_btnSlideShow.style.background=""; }
}

function set_slide_number(){
	console.log("------------------set_slide_number");
	isSlideShow = false;window.g_btnSlideShow.style.background="";
	var slideNumber = g_txtPageNumber.value; if(slideNumber == "")return;
	if(slideNumber >=1){
		switch(g_ScreenShareType){
			case 1:{ // image share
				if(slideNumber<=imageArray.length){
					window.imageIndex = slideNumber - 1;
					startImageScreenShareSend(window.imageIndex);
				} else { g_txtPageNumber.value = ""; }
				break;
			}
			case 2:{ // pdf share
				if(slideNumber<=window.g_PdfPageCount){
					window.g_PdfPageNumber = slideNumber;
					window.g_PdfDocument.getPage(window.g_PdfPageNumber).then(onPdfPageLoad);
				} else { g_txtPageNumber.value = ""; }
				break;
			}
		}
	} else { g_txtPageNumber.value = ""; }
}

function on_first_click(){
	console.log("-----------------on_first_click()");
	isSlideShow = false;window.g_btnSlideShow.style.background="";
	switch(g_ScreenShareType){
		case 1:{ if(imageArray.length){startImageScreenShareSend(window.imageIndex=0);}break;}
		case 2: {if(g_PdfPageCount){window.g_PdfDocument.getPage(window.g_PdfPageNumber=1).then(onPdfPageLoad);}break;}
	}
}

function on_prev_click(){
	console.log("---------------------on_prev_click()");
	isSlideShow = false;window.g_btnSlideShow.style.background="";
	switch(g_ScreenShareType){
		case 1:{if(window.imageIndex>0){startImageScreenShareSend(--window.imageIndex);}break;}
		case 2: {if(window.g_PdfPageNumber >= 2){window.g_PdfDocument.getPage(--window.g_PdfPageNumber).then(onPdfPageLoad);}break;}
	}
}

function on_next_click(){
	console.log("------------------on_next_click()");
	isSlideShow = false;
	switch(g_ScreenShareType){
		case 1:{ if(window.imageIndex < imageArray.length-1){startImageScreenShareSend(++window.imageIndex);}break;}
		case 2: {if(window.g_PdfPageNumber < window.g_PdfPageCount){window.g_PdfDocument.getPage(++window.g_PdfPageNumber).then(onPdfPageLoad);}break;}
	}
}

function on_last_click(){
	console.log("--------on_last_click()");
	isSlideShow = false;window.g_btnSlideShow.style.background="";
	switch(g_ScreenShareType){
		case 1:{ if(imageArray.length){startImageScreenShareSend(window.imageIndex=imageArray.length-1);}break;}
		case 2: {if(g_PdfPageCount){window.g_PdfDocument.getPage(window.g_PdfPageNumber=g_PdfPageCount).then(onPdfPageLoad);}break;}
	}
}


function listenForSlideNumberEnter(event){ if (typeof event == 'undefined' && window.event) {event = window.event; } if (event.keyCode == 13 || event.which == 13) { set_slide_number(); return false; } return true; }



function slideShowControls(isEnable){
	if(isEnable){g_btnSlideShow.disabled = "";g_txtPageNumber.disabled = "";g_btnFirstPage.disabled = "";g_btnPrevPage.disabled = "";g_btnNextPage.disabled = "";g_btnLastPage.disabled = "";} 
	else {window.g_btnSlideShow.style.background="";g_btnSlideShow.disabled = "disabled";g_txtPageNumber.disabled = "disabled";g_btnFirstPage.disabled = "disabled";g_btnPrevPage.disabled = "disabled";g_btnNextPage.disabled = "disabled";g_btnLastPage.disabled = "disabled";}
}


function strEndsWith(str, suffix) {
    return str.match(suffix+"$")==suffix;
}



var packetSize = 64000,textToTransfer = '',numberOfPackets = 0, packets = 0, screenDelay=500;
function onReadAsDataURLforChrome(event, text,typeOfFile){
	
	var data = {type: typeOfFile};
	
	if (event) {
		console.log("Screen share fisrt data");
		data.first= true;
        numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);
	}
    
    if (text.length > packetSize){
    	data.first= false;
    	data.message = text.slice(0, packetSize);
    }
    else {
    	data.first= false;
        data.message = text;
        data.last = true;
    }
    console.log("-------------sending data-----------------------");
    jsonData = JSON.stringify(data);
    console.log(jsonData);
    sendDataMessage(jsonData);
 
    textToTransfer = text.slice(data.message.length);
	
    if (textToTransfer.length) {
        setTimeout(function() {
        	onReadAsDataURLforChrome(false, textToTransfer,typeOfFile);
        }, window.moz ? 1 : screenDelay);
        // bug: what's the best method to speedup data transferring on chrome?
    }
}

function processDroppedFileContent(droppedFile){
console.log("---------------------processDroppedFileContent()");
var data = new FormData();
data.append('roomname', g_RoomName);
data.append('file', droppedFile);
data.append('filename', droppedFile.name);
var xhr = new XMLHttpRequest();
xhr.open('POST', '/upload_file/', true);
var fileToShare = droppedFile.name;
xhr.onload = function () {
	window.canvas_screen_share.style.display = 'none';
	try{window.div_screen_share.removeChild(window.img_screen_share);} catch(e){}
	window.div_screen_share.appendChild(window.vid_screen_share);
	g_ScreenShareType = 0;
	window.vid_screen_share.setAttribute("src", gMediaUrl + g_RoomName + "/" + fileToShare);
	var fileExtension = fileToShare.substr(fileToShare.lastIndexOf('.') + 1);
	window.vid_screen_share.setAttribute("type", "video/"+fileExtension.split(".")[1]);
	window.vid_screen_share.load();
    slideShowControls(false);
	startVideoScreenShareSend();
};
try{xhr.send(data);}
catch (e){console.log('Exception: ' + e.message);}
}

function processDroppedFolderContent(){
console.log("-------------------------Image dropped");
var data = new FormData();
data.append('roomname', g_RoomName);
data.append('foldername', window.folderToShare);
data.append('file', g_SlideShareUploadFiles[g_SlideShareUploadFileIndex]);
data.append('filename',
g_SlideShareUploadFiles[g_SlideShareUploadFileIndex].name);
var xhr = new XMLHttpRequest();
xhr.open('POST', '/upload_folder/', true);
xhr.onload = function(){
	g_SlideShareUploadFileIndex++;
	if(g_SlideShareUploadFileIndex < g_SlideShareUploadFiles.length) {processDroppedFolderContent();} 
	else {g_SlideShareUploadFileIndex = 0;g_SlideShareUploadFiles = null;g_ScreenShareType = 1;start_image_share();}
};
try{xhr.send(data);}
catch (e){console.log('Exception: ' + e.message);}
}
function startImageScreenShareSend(imageIndex){
	console.log("--------startImageScreenShareSend");
	window.imageIndex = imageIndex;
	window.g_txtPageNumber.value = window.imageIndex+1;
	window.img_screen_share.onload = function(){
		window.context_screen_share.drawImage(window.img_screen_share,0,0,window.canvas_screen_share.width, window.canvas_screen_share.height);
		var screenshotvalue = window.canvas_screen_share.toDataURL('image/webp', 1);
		if(!window.moz){
				onReadAsDataURLforChrome(true,screenshotvalue,'image');
		}else{
			 console.log("Screenshot size = " + screenshotvalue.length);
			for(var peer in g_RemotePeerDataChannels){
				try{g_RemotePeerDataChannels[peer].send(JSON.stringify({screenshot: screenshotvalue}));}
				catch (e){console.log('Exception: ' + e.message);}
			}
		}
	};
	 window.img_screen_share.src =
	 gMediaUrl+g_RoomName+"/"+window.folderToShare+"/"+imageArray[window.imageIndex];
}

function start_image_share(){
	
	console.log("----------------start_image_share");
	if(window.img_screen_share.parentNode === null) {
        window.div_screen_share.appendChild(window.img_screen_share);
        window.img_screen_share.src='';
    }
	if(!window.moz){
		if(isSlideShow){
			on_slideshow_click();
			setTimeout(function(){ wait_image_share(); },5000);
		}else{
			wait_image_share();
		}
	}else{
	if(window.folderToShare != null && window.folderToShare != ''){
		window.canvas_screen_share.style.display = 'none';
        window.img_screen_share.width = window.vid_screen_share.clientWidth;
        window.img_screen_share.height = window.vid_screen_share.clientHeight;
   		window.canvas_screen_share.width = window.img_screen_share.width;
		window.canvas_screen_share.height = window.img_screen_share.height;
        try{window.div_screen_share.removeChild(window.vid_screen_share);} catch(e){}
        if(window.img_screen_share.parentNode === null) {
	        window.div_screen_share.appendChild(window.img_screen_share);
        }
        slideShowControls(true);
	 get_images(g_RoomName+"/"+window.folderToShare);
		 http:www.att.com/support_static_files/manuals/ATT_Tilt.pdf
		} else { alert('Please input a file to share'); }
	}
}

function wait_image_share(){
	
	console.log("-----------------wait_image_share");
	if(window.folderToShare != null && window.folderToShare != ''){
		window.canvas_screen_share.style.display = 'none';
        window.img_screen_share.width = window.vid_screen_share.clientWidth;
        window.img_screen_share.height = window.vid_screen_share.clientHeight;
   		window.canvas_screen_share.width = window.img_screen_share.width;
		window.canvas_screen_share.height = window.img_screen_share.height;
        try{window.div_screen_share.removeChild(window.vid_screen_share);} catch(e){}
        if(window.img_screen_share.parentNode === null) {
	        window.div_screen_share.appendChild(window.img_screen_share);
        }
        slideShowControls(true);
        imageIndex = 0;
		startImageScreenShareSend(imageIndex);
		 get_images(g_RoomName+"/"+window.folderToShare);
		 http:www.att.com/support_static_files/manuals/ATT_Tilt.pdf
		} else { alert('Please input a file to share'); }
}
function action_end_session(){ 
	session_clean_all();
	ws_send(2,{'username': g_SelfName,'roomname':g_RoomName});
}

function formatSizeUnits(bytes)
{
	if(bytes < 1048576){
		 return 1;
	}
    if ( ( bytes >> 30 ) & 0x3FF )
        bytes = ( bytes >>> 30 ) + '.' + ( bytes & (3*0x3FF )) + 'GB' ;
    else if ( ( bytes >> 20 ) & 0x3FF )
        bytes = ( bytes >>> 20 ) + '.' + ( bytes & (2*0x3FF ) ) + 'MB' ;
    else if ( ( bytes >> 10 ) & 0x3FF )
        bytes = ( bytes >>> 10 ) + '.' + ( bytes & (0x3FF ) ) + 'KB' ;
    else if ( ( bytes >> 1 ) & 0x3FF )
        bytes = ( bytes >>> 1 ) + 'Bytes' ;
    else
        bytes = bytes + 'Byte' ;
    return bytes.replace('MB','');
}

var tempTotalPackets=0;
var percentage=0;
var chunkCount;
function send_file(fileToSend){
		if(!(parseFloat(formatSizeUnits(fileToSend.size)) <= gFileSize)){
			onNewAlert("File Size Limit Exceeded!!!");
			return;
		}
		for(var peer in g_RemotePeerDataChannels){
			try{ g_RemotePeerDataChannels[peer].send(JSON.stringify( {filename: fileToSend.name} )); }
			catch (e){ console.log('Exception: ' + e.message); }
			try{ 
				chrome_ff_send_file(fileToSend,g_RemotePeerDataChannels[peer],Object.keys(window.g_RemotePeerDataChannels).length); }
			catch (e){ console.log('Exception: ' + e.message); }
		}
}



function appendBuffer( buffer1, buffer2 ) {
	
	  var tmp = new Uint8Array( buffer1.byteLength + buffer2.byteLength );
	  tmp.set( new Uint8Array( buffer1 ), 0 );
	  tmp.set( new Uint8Array( buffer2 ), buffer1.byteLength );
	  return tmp.buffer;
}

//******************************Receiver side****************************************************//

var content = { };
var uuid=0;
function receive(data) {
	if(data.first){
		document.getElementById('image_share_controls').style.display = "none";
		console.log("first screen data received");
		delete content[uuid];
		 window.img_screen_share.src='';
	}
	if (!content[uuid]){
		content[uuid] = [];
	}
	content[uuid].push(data.message);
	// if it is last packet
	if (data.last) {
		try{
		   document.getElementById('canvas_screen_share').style.display = "none";
		   document.getElementById('image_share_controls').style.display = "none";
		   //showScreenShare();
		   console.log("last screen data received");
	       var joinDataURL = content[uuid].join('');
	       window.img_screen_share.src =joinDataURL;
	       $("#share").width($("#img_screen_share").width())
	   	$("#share").height($("#img_screen_share").height()-200)
	   	$("#share").css({overflow:"scroll"})
	   	   pdfShow = true;
	   	   showPdfScreen();
	       content[uuid] = [];
	       delete content[uuid];
		}catch (e){
			console.log('receiving side Exception: ' + e.message);
		}
	}
}

var buffer;
var firstChunk=0;
var totalNoRecPackets=0, rPackets=0;
var recChunkSize=64000;
var arrayBufferChunks = [], blob = null;
var recFileSize=0;
function onNewScreenContent(event){
	event=JSON.parse(event.content);
	console.log("-------------------onNewScreenContent");
	if (!event.message) return;
	if(event.message.length){
		if(firstChunk==0){
			console.log("rec first packet");
			buffer=event.message;
			firstChunk=1;
		}else{
			buffer=appendBuffer(buffer,event.message);
		}
		rPackets--;
	}
	if(event.message.packets && window.saveFileName) {
			arrayBufferChunks.push(event.message);
			rPackets--;
	}
	var jsonresp = event;
	if(jsonresp.screenshot) {
		window.img_screen_share.src = jsonresp.screenshot;
	}else if(jsonresp.type == 'pdf' && jsonresp.message) {
		receive(event);
	}else if(jsonresp.type == 'image' && jsonresp.message) {
		receive(event.message);
	}else if(jsonresp.type == 'video' && jsonresp.message) {
		receive(event.message);
	}else if(jsonresp.type == 'canvas') {
		var myCanvas;
		if(document.getElementById('show_whiteBoard').style.display == 'none'){
			myCanvas = document.getElementById('peerBoard');
		  }else if(document.getElementById('show_whiteBoard').style.display == 'block'){
			myCanvas = document.getElementById('whiteBoard');
		  }
		var ctx = myCanvas.getContext('2d');
		var img = new Image;
		img.onload = function(){
		  ctx.drawImage(img,0,0); // Or at whatever offset you like
		};
		img.src = jsonresp.whiteBoardData;
	}else if(jsonresp.message){
		update_im_msg(jsonresp.message,1, jsonresp.peername);
	} else if(jsonresp.filename){
		window.saveFileName = jsonresp.filename;
		return;
	}else if(jsonresp.lastchunk){
			if(window.moz){
				console.log("rec last packet");
				var a = document.createElement('a');
				document.body.appendChild(a);
				blob=new Blob( arrayBufferChunks, {type : jsonresp.fileType});
				arrayBufferChunks = [];
				url = window.URL.createObjectURL(blob);
		        a.href = url;
		        a.download = window.saveFileName;
		        a.click();
		        window.saveFileName = null;
			}else{
				console.log("rec last packet");
				var a = document.createElement('a');
				a.href = window.URL.createObjectURL(new Blob( [buffer], {type : jsonresp.fileType}));
				buffer=null;
				firstChunk=0;
				percentage=0;
				chunkCount=0;
				a.download = window.saveFileName;
				a.click();
				window.saveFileName = null;
			}
	}else if(jsonresp.fileSize){
		chunkCount=jsonresp.chunkSize;
		recFileSize=jsonresp.fileSize;
		percentage=(chunkCount/jsonresp.fileSize)*100;
		document.getElementById('file_transfer').style.display = "none";
		 if (window.moz) {
			 document.getElementById('progressId').style.height = "1.1em";
		 }
		 document.getElementById('file_progress').style.display = "flex";
		 document.getElementById('imagePath').src = "/static/images/download.png";
		 document.getElementById('uplod_downlaod').style.display = "inline";
		document.getElementById('progress_prec').style.display = "inline";
		totalNoRecPackets= rPackets = parseInt(jsonresp.fileSize/jsonresp.chunkSize);
	}
};

window.div_screen_share = document.getElementById("div_screen_share");
window.vid_screen_share = document.getElementById("vid_screen_share");
window.img_screen_share = document.getElementById("img_screen_share");
window.canvas_screen_share = document.getElementById("canvas_screen_share");
window.g_btnSlideShow = document.getElementById('slideshow_button_id');
window.g_txtPageNumber = document.getElementById('slide_number');
window.g_btnFirstPage = document.getElementById('first_button_id');
window.g_btnPrevPage = document.getElementById('prev_button_id');
window.g_btnNextPage = document.getElementById('next_button_id');
window.g_btnLastPage = document.getElementById('last_button_id');
window.context_screen_share = window.canvas_screen_share.getContext('2d');
window.context_screen_share.fillRect(0,0,window.canvas_screen_share.width, window.canvas_screen_share.height);
window.div_screen_share.addEventListener("drop", onContentDropped, false);
document.getElementById('div_screen_share').style.height = "97%";
document.getElementById('div_screen_share').style.top = "auto";

var pdfShow = true;
function showPdfScreen(){
	if(pdfShow){
		 $("#clickshare").parent().animate({right:'0px'}, {queue: false, duration: 500});
		  $("#clickshare1").parent().animate({left:'0px'}, {queue: false, duration: 500});
		//  $("#clickshare").parent().animate({opacity: 'show'},'slow');
		 // $("#clickshare1").parent().animate({opacity: 'show'},'slow');
		  pdfShow = false;
	}else{
		 $("#clickshare").parent().animate({right:'-63%'}, {queue: false, duration: 500});
		 $("#clickshare1").parent().animate({left:'-63%'}, {queue: false, duration: 500});
	//	 $("#clickshare").parent().animate({opacity: 'hide'},'slow');
	//	 $("#clickshare1").parent().animate({opacity: 'hide'},'slow');
		 pdfShow = true;
	}
}

