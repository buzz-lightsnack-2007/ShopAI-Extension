import Popup from "/scripts/GUI/popup.js";

export default class ManagedPopup {
	constructor () {
		this.instance = new Popup({"popup": "/pages/popup.htm", "hidden": true});
		this.listener = chrome.runtime.onMessage.addListener(
			(request, sender, sendResponse) => {
				(request.action == "popup_open") ? this.enable() : this.disable();
			}
		);
	}
	
	/*
	Enable the popup. 
	*/
	enable() {
		this.instance.enable();
	}

	/* 
	Close and disable the popup. 
	*/
	disable() {
		// Close the sidebar. 
		this.instance.disable();
	}
}