import BrowserIcon from '/scripts/GUI/browsericon.js';
import Tabs from '/scripts/GUI/tabs.js';
import texts from "/scripts/mapping/read.js";
import {global, observe} from "/scripts/secretariat.js";

const CONFIG = chrome.runtime.getURL("styles/colors/icon.json");

class IconIndicator {
	/* 
	Indicate that the website is supported through icon change. 
	*/
	static enable() {
		BrowserIcon.enable();

		// Enable icon changes if enabled within the settings. 
		global.read([`settings`, `behavior`, `showApplicable`]).then(async (PREFERENCE) => {(PREFERENCE)
			? fetch(CONFIG).then((response) => response.json()).then((jsonData) => {
				const ICON_COLORS = jsonData;

				/*
				Show an iconified summary of the results. 
	
				@param {string} location the URL of the page
				@param {string} ID the tab's ID
				*/
				function showDetails(location, ID) {
					let LOCATION = location; 
					// If the tab data is ready, change the icon to reflect the results. 
					global.read([`sites`, LOCATION, `status`]).then(async (STATUS) => {
						if (STATUS) {
							(STATUS[`error`]) ? BrowserIcon.set({
									"BadgeText": await (new texts(`extensionIcon_error`)).symbol,
									"BadgeBackgroundColor": ICON_COLORS[`error`]
								}, {"tabId": ID}) : false;

							if (STATUS[`done`]) {
								global.read([`sites`, LOCATION, `analysis`, `Rating`, `Trust`]).then(async (RESULTS) => {
									((typeof RESULTS).includes(`str`)) ? RESULTS.trim() : false;
									(RESULTS) ? BrowserIcon.set({
											"BadgeText": await (new texts(`extensionIcon_product_`.concat(RESULTS))).symbol,
											"BadgeBackgroundColor": ICON_COLORS[`product_`.concat(RESULTS)]
										}, {"tabId": ID}) : false;
								})
							};
						};
					});
				}
	
				
				(Tabs.query(null, 0)).then(async (TAB) => {
					// Get the URL of the tab. 
					let LOCATION = TAB.url;
		
					BrowserIcon.set({
							"BadgeText": await (new texts(`extensionIcon_website_loading`)).symbol,
							"BadgeBackgroundColor": ICON_COLORS[`loading`]
						}, {"tabId": TAB.id});
		
					showDetails(LOCATION, TAB.id);
					observe((changes) => {
						showDetails(LOCATION, TAB.id);
					})
				});
			})
			: false;
		})

	}

	/* 
	Indicate that the website isn't supported through icon change. 
	*/
	static disable() {
		BrowserIcon.disable();

		// Enable icon changes if enabled within the settings. 
		global.read([`settings`, `behavior`, `showApplicable`]).then((PREFERENCE) => {
			(Tabs.query(null, 0)).then(async (TAB) => {
				BrowserIcon.set({
						"BadgeText": await (new texts(`extensionIcon_website_unsupported`)).symbol,
						"BadgeBackgroundColor": await fetch(CONFIG).then((response) => response.json()).then((jsonData) => {return (jsonData[`N/A`]);})
					}, {"tabId": TAB.id});
			})
		})
	}
	
	/*
	Set the function. 
	
	@param {function} callback the function to run.
	*/
	static set(callback) {
		BrowserIcon.addActionListener("onClicked", callback);
	}

	/*
	The action when the icon is clicked.
	*/
	static onclick() {
		// Check if autorunning is not enabled. 
		(global.read([`settings`, `behavior`, `autoRun`])).then((result) => {
			if (!result) {
				(Tabs.query(null, 0)).then((TAB) => {
					// Tell the content script to begin scraping the page. 
					chrome.tabs.sendMessage(TAB.id, {"refresh": true});
				});
			}
		});
	}
}

export {IconIndicator as default};