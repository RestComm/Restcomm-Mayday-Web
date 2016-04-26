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
var isURLSent = false;
var callInitiator = false;
var disableTogetherJSAutoStart = false;
var sendTogetherJSSessionId = false;
var togetherJSSessionId = "";

var g_username =sessionStorage.getItem('username');

function sendCoBrowseLink(shareLink){
	if(callInitiator && !isURLSent){
					try {
						sendDataMessage(JSON.stringify({type : 'url',
						content : shareLink + "&custPageWidth="+$('#sketch').width() + "&custPageHeight=" + $('#sketch').height()
						}));
						isURLSent = true;
						console.log(" cobrowser link === width "+$('#sketch').width() +"height " + $('#sketch').height());
					} catch (err) {
						
						console.error(err);
					}
	updateCoBrowserLink(true);
	}
}

function setIframeWidth(){
	if(document.getElementById("peerBrowser").src.indexOf("blank") != -1){
		return
	}
console.log("setIFrmaeWidth");
	try{
		if(document.getElementById("peerBrowser").contentDocument.getElementById("main_div")) {
			var pageWidth = document.getElementById("peerBrowser").contentDocument.documentURI.split("custPageWidth=")[1].split("&")[0];
			var pageHeight = document.getElementById("peerBrowser").contentDocument.documentURI.split("custPageHeight=")[1];
			console.log("Customer Page Width -> " + pageWidth + ", pageHeight -> " + pageHeight);
			document.getElementById("peerBrowser").contentDocument.getElementById("main_div").style.paddingLeft="39px";
			document.getElementById("peerBrowser").contentDocument.getElementById("sketch").width = pageWidth;
			document.getElementById("peerBrowser").contentDocument.getElementById("sketch").height = pageHeight;
		
			document.getElementById("peerBrowser").contentDocument.getElementById("main_div").style.width = pageWidth +"px";
			document.getElementById("peerBrowser").contentDocument.getElementById("main_div").style.height = pageHeight +"px";
			document.getElementById("peerBrowser").contentDocument.getElementById('sketch').getContext('2d').strokeStyle = "#FF00FF";
			clearCanvasUI();
		}	
	}catch(e){
		console.error(e);
	}

	var coBrowsingLink = null;
	try {
		coBrowsingLink = document.getElementById("peerBrowser").contentDocument.getElementById("enableCoBrowsering");
	} catch(err) {
		console.error("unable to get togather object: " +err);
	}
	if(coBrowsingLink){
		console.log("----------------coBrowsingLink---------------"+coBrowsingLink.text);
		
		if(coBrowsingLink.text == "Enable Co-Browsing"){
			coBrowsingLink.text="Disable Co-Browsing";
			coBrowsingLink.style.display = "block";
			console.log (" -----text 1 "+coBrowsingLink.text+"-- ");
			console.log("Disable Co-Browsing");
			showHideCoBrowsing(true);
		}else{
			coBrowsingLink.text="Enable Co-Browsing";	
			coBrowsingLink.style.display = "block";
			console.log (" -----text 2 "+coBrowsingLink.text+"-- ");
			console.log("Enable Co-Browsing");
			showHideCoBrowsing(false);
		}
	}
	showHideCanvas(true);
	var isCanvasEnabled = sessionStorage.getItem("isCanvasEnabled");
	if(isCanvasEnabled && isCanvasEnabled == "true"){
		updateCanvasUI(true);
	}
}

window.updateCanvas = function(isEnabled){
				try {
					sendDataMessage(JSON.stringify({
						type : "updateCanvas",
						canvasEnabled : isEnabled
					}));
					console.log(" updateCanvas \n");
				} catch (err) {
					
					console.error(err);
				}
}
window.updateCanvas_agent = function(){
				try {
					sendDataMessage(JSON.stringify({
						type : "updateCanvas_agent",
					}));
					console.log(" updateCanvas_agent \n");
				} catch (err) {
					console.error(err);
				}
}
window.clearCanvas = function(){
				try {
					sendDataMessage(JSON.stringify({
						type : "clearCanvas"
					}));
				} catch (err) {
					console.error(err);
				}
}

window.updateCoBrowsing = function(isEnabled){
	console.log("-----------updateCoBrowsing----------------"+isEnabled);
	requestCoBrowsingAccess();
}

function updateCanvasUI(isEnabled){
	console.log("-----updateCanvasUI------------"+isEnabled);
	if(isEnabled && isEnabled != "false"){
		if(g_username.indexOf("test") == 0 || g_username.indexOf("jack") == 0){
			try{
			     console.log("updateCanvasUI --disable \n");
				document.getElementById("peerBrowser").contentDocument.getElementById("sketch").style.display = "block";
				document.getElementById("peerBrowser").contentDocument.getElementById("btnHandleCanvas").text = "Disable Annot";
			}catch(err){
				console.error(err);
			}			
		} else {
			try{
				$("#sketch").css("display", "block");
				document.getElementById("btnHandleCanvas").text="Disable Annot";
				console.log("------ enabled the annotation in customer page -------");
			}catch(err){
				console.error(err);
			}
		}
	} else {
		if(g_username.indexOf("test") == 0 || g_username.indexOf("jack") == 0){
			try{
			   console.log("updateCanvasUI --Enable \n");
				document.getElementById("peerBrowser").contentDocument.getElementById("sketch").style.display = "none";
			}catch(err){
			}
			try{
				document.getElementById("peerBrowser").contentDocument.getElementById("btnHandleCanvas").text = "Enable Annot";
			}catch(err){
				console.error(err);
			}
		} else {
			try{
				$("#sketch").css("display", "none");
			  	document.getElementById("btnHandleCanvas").text= "Enable Annot";
				console.log("------ disabled the annotation in customer page -------");
			}catch(err){
				console.error(err);
			}
		}		
	}
	
}

function clearCanvasUI(){
	console.log("Clear Canvas UI.");
	if(g_username.indexOf("test") == 0 || g_username.indexOf("jack") == 0){
		try {
			var c=document.getElementById("peerBrowser").contentDocument.getElementById("sketch");
			var ctx=c.getContext("2d");
			ctx.clearRect(0, 0, c.width, c.height);
		} catch(err) {
			console.log(err);
		}
	} else {
		try {
			var c=document.getElementById("sketch");
			var ctx=c.getContext("2d");
			ctx.clearRect(0, 0, c.width, c.height);
		} catch(err) {
			console.log(err);
		}
	}
}

window.sendDataChannelMessage = function(typeValue, paramName, paramValue){
	console.log("==================sendDataChannelMessage=================");
	console.log("typeValue -> " + typeValue + ", paramName -> " + paramName + ", paramValue -> " + paramValue);	
				try {
					console.log("sending message  = "+typeValue +" to " );
					sendDataMessage(JSON.stringify({
						type : typeValue,
						paramName : paramValue
						}));
				} catch (err) {
					console.error(err);
				}
}

window.getCoBrowsingAccess = function(){
	console.log("getCoBrowsingAccess");
	var r = confirm("Agent is requesting to share this web page. Do you want to share?");
	if (r == true) {
		startTogetherJS();
	} else {
    		sendDataChannelMessage("coBrowsingAccess","isAllowed",false);
	}
}

window.requestCoBrowsingAccess = function(){
	console.log("requestCoBrowsingAccess");
	sendDataChannelMessage("reqCoBrowsingAccess","test","test");
}

window.releaseCoBrowsingAccess = function(){
	console.log("releaseCoBrowsingAccess");
	sendDataChannelMessage("releaseCoBrowsingAccess","test","test");
	stopTogetherJS();
	document.getElementById("peerBrowser").src = "blank.htm";
}

window.updateCoBrowsingAccess = function(isAllowed){
	console.log("updateCoBrowsingAccess... isAllowed ? " + isAllowed);
}

function startTogetherJS(){
	console.log("Starting Together JS from Call Iniitiator...");
	var isTogetherJSRunning = false;
	try {
		isTogetherJSRunning = TogetherJS.running;
	} catch(err) {
	}
	if(!isTogetherJSRunning){
		if(togetherJSSessionId && togetherJSSessionId != ""){
			joinTogetherJS();
		} else {
			if(!disableTogetherJSAutoStart){
				TogetherJS(this);
			}
		}
	} else {
		alert(TogetherJS.shareUrl());
		sendCoBrowseLink(TogetherJS.shareUrl() + "&isLoadWSC=false");
	}
}

function stopTogetherJS(){
	var isTogetherJSRunning = false;
	try {
		isTogetherJSRunning = TogetherJS.running;
	} catch(err) {
	}
	if(isTogetherJSRunning){
		try{
			$("#togetherjs-end-session").click();
		}catch(err){
		}
	}
	sessionStorage.removeItem("isCanvasEnabled");
	sessionStorage.removeItem("isCoBrowsingEnabled");
	sessionStorage.removeItem("coBrowsingUrl");
}

function updateCoBrowserLink(isEnabled){
	console.log("updateCoBrowserLink ? " + isEnabled);
	var coBrowsingLink = document.getElementById("enableCoBrowsering");
	if(coBrowsingLink){
		if(isEnabled){
			coBrowsingLink.text="Disable Co-Browsing";
			showHideCanvas(true);
		}else{
			coBrowsingLink.text="Enable Co-Browsing";
			sessionStorage.removeItem("isCoBrowsingEnabled");
			sessionStorage.removeItem("coBrowsingUrl");
			updateCanvasUI(false);
		}
	}
}

function joinTogetherJS(){
	console.log("joining in together js session");
	TogetherJS.startup._joinShareId = togetherJSSessionId;
	TogetherJS();
	sessionStorage.setItem("togetherJSSessionId",togetherJSSessionId);
}

function enableCoBrowsering(){
	disableTogetherJSAutoStart = false;
	var coBrowsingLink = document.getElementById("enableCoBrowsering");
	if(coBrowsingLink.text == "Enable Co-Browsing"){
		coBrowsingLink.text="Disable Co-Browsing";
		console.log (" -----text 1 "+coBrowsingLink.text+"-- ");
		console.log("Disable Co-Browsing");
		if(g_username.indexOf("test") == 0 || g_username.indexOf("jack") == 0){
		    	parent.requestCoBrowsingAccess();
		} else {
			if(togetherJSSessionId && togetherJSSessionId != ""){
				joinTogetherJS();
			} else {
				startTogetherJS();
			}
		}
		sessionStorage.setItem("isCoBrowsingEnabled",true);
		showHideCanvas(true);
	}else{
		handleClearCanvas();
		coBrowsingLink.text="Enable Co-Browsing";	
		console.log (" -----text 2 "+coBrowsingLink.text+"-- ");
		console.log("Enable Co-Browsing");
		if(g_username.indexOf("test") == 0 || g_username == "" || g_username.indexOf("jack") == 0){
			parent.releaseCoBrowsingAccess();
		} else {
			stopTogetherJS();
			isURLSent = false;
			sendDataChannelMessage("stopedTogetherJs","test","test");
		}
		sessionStorage.removeItem("isCoBrowsingEnabled");
		sessionStorage.removeItem("coBrowsingUrl");
		updateCoBrowserLink(false);
		showHideCanvas(false);
	}
}

function handleCanvas(){
	console.log("handleCanvas");
	var btnCanvas = document.getElementById("btnHandleCanvas");
	var isEnabled = false;
	if(btnCanvas.text == "Enable Annot"){
		$("#sketch").css("display", "block");
	   	btnCanvas.text="Disable Annot";
		isEnabled = true;
	} else {
	    	$("#sketch").css("display", "none");
		btnCanvas.text="Enable Annot";
	}
	if(g_username.indexOf("test") == 0 || g_username.indexOf("jack") == 0){
	    console.log("--agent");
	    //canvasWidthFix();
		parent.updateCanvas(isEnabled);	
	} else {
		console.log("--Customer");
		updateCanvas_agent();
		updateCanvas(isEnabled);	
	}
	sessionStorage.setItem("isCanvasEnabled", isEnabled);
}

function handleClearCanvas(){
	console.log("Handle Clear Canvas...");
	clear(true);
	if(g_username.indexOf("test") == 0 || g_username.indexOf("jack") == 0){
		parent.clearCanvas();
	} else {
		clearCanvas();
	}
}

function showHideCanvas(isShown){
	var canvas = null;
	if(g_username.indexOf("test") == 0 || g_username.indexOf("jack") == 0){
		canvas = document.getElementById("peerBrowser").contentDocument.getElementById("btnHandleCanvas");
		document.getElementById("peerBrowser").contentDocument.getElementById("loginPage").style.display="none";
		document.getElementById("peerBrowser").contentDocument.getElementById("agentMainScreen").style.display="block";
	} else {
		canvas = document.getElementById("btnHandleCanvas");
	}
	if(canvas){
		if(isShown){
			canvas.style.display = "block";
		} else {
			canvas.style.display = "none";		
		}
	}
}

function showHideCoBrowsing(isShown){
	var coBrowsing = document.getElementById("enableCoBrowsering");
	if(coBrowsing){
		if(isShown){
			coBrowsing.style.display = "block";
			if(coBrowsing.text != "Enable Co-Browsing"){
				showHideCanvas(true);
			}
		} else { 
			coBrowsing.style.display = "none";
		}
	}
}