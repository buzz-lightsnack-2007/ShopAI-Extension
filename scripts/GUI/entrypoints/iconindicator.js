import BrowserIcon from '/scripts/GUI/browsericon.js';
import Image from '/scripts/mapping/image.js';
import Tabs from '/scripts/GUI/tabs.js';
import texts from "/scripts/mapping/read.js";
import {session} from '/scripts/secretariat.js';

const CONFIG = chrome.runtime.getURL("styles/colors/icon.json");

class IconIndicator {
	/* 
	Indicate that the website is supported through icon change. 
	*/
	static enable() {
		BrowserIcon.enable();
		(Tabs.query(null, 0)).then(async (TAB) => {
			BrowserIcon.set({
					"BadgeText": await (new texts(`extensionIcon_website_loading`)).symbol,
					"BadgeBackgroundColor": await fetch(CONFIG).then((response) => response.json()).then((jsonData) => {return (jsonData[`loading`]);})
				}, {"tabId": TAB.id});
		})
	}

	/* 
	Indicate that the website isn't supported through icon change. 
	*/
	static disable() {
		BrowserIcon.disable();
		(Tabs.query(null, 0)).then(async (TAB) => {
			BrowserIcon.set({
					"BadgeText": await (new texts(`extensionIcon_website_unsupported`)).symbol,
					"BadgeBackgroundColor": await fetch(CONFIG).then((response) => response.json()).then((jsonData) => {return (jsonData[`N/A`]);})
				}, {"tabId": TAB.id});
		})
	}
	
	/*
	Set the function. 
	
	@param {function} callback the function to run.
	*/
	static set(callback) {
		BrowserIcon.addActionListener("onClicked", callback);
	}
}

export {IconIndicator as default};