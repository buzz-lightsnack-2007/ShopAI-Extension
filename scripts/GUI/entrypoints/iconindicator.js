import BrowserIcon from '/scripts/GUI/browsericon.js';
import Tabs from '/scripts/GUI/tabs.js';
import texts from "/scripts/mapping/read.js";
import {global, background} from "/scripts/secretariat.js";
import {URLs} from "/scripts/utils/URLs.js";

const CONFIG = chrome.runtime.getURL("styles/colors/icon.json");

class IconIndicator {
	/* 
	Indicate that the website is supported through icon change. 
	*/
	static enable() {
		BrowserIcon.enable();
		BrowserIcon.addActionListener("onClicked", () => {BrowserIcon.onclick();});

		// Enable icon changes if enabled within the settings. 
		(Tabs.query(null, 0)).then((TAB) => {
			// Get the URL of the tab. 
			const LOCATION = URLs.clean(TAB.url);

			global.read([`settings`, `general`, `showApplicable`]).then((PREFERENCE) => {(PREFERENCE)
				? fetch(CONFIG).then((response) => response.json()).then(async (jsonData) => {
					const ICON_COLORS = jsonData;
	
					/*
					Show an iconified summary of the results. 
		
					@param {string} location the URL of the page
					@param {string} ID the tab's ID
					*/
					function showDetails(location, ID) {
						let LOCATION = location; 
						// If the tab data is ready, change the icon to reflect the results. 
						global.read([`sites`, LOCATION, `status`], -1).then(async (STATUS) => {
							if (STATUS)  {
								(STATUS[`error`]) ? BrowserIcon.set({
										"BadgeText": (new texts(`extensionIcon_error`)).symbol,
										"BadgeBackgroundColor": ICON_COLORS[`error`]
									}, {"tabId": ID}) : false;
	
								if (STATUS[`done`] && (typeof STATUS[`done`]).includes(`num`)) {
									(STATUS[`done`] >= 1)
										? global.read([`sites`, LOCATION, `analysis`, `Rating`, `Trust`]).then(async (RESULTS) => {
										(RESULTS) ? BrowserIcon.set({
												"BadgeText": (new texts(`extensionIcon_product_`.concat(RESULTS))).symbol,
												"BadgeBackgroundColor": ICON_COLORS[`product_`.concat(RESULTS)]
											}, {"tabId": ID}) : false;
										})
										: ((STATUS[`done`] > 0)
											? BrowserIcon.set({
												"BadgeText": String(parseFloat(STATUS[`done`] * 100)).concat(`%`),
												"BadgeBackgroundColor": ICON_COLORS[`loading`]})
											: false);
								};
							};
						});
					}

					BrowserIcon.set({
							"BadgeText": (new texts(`extensionIcon_website_loading`)).symbol,
							"BadgeBackgroundColor": ICON_COLORS[`loading`]
						}, {"tabId": TAB.id});
		
					showDetails(LOCATION, TAB.id);
					new background((changes) => {
						showDetails(LOCATION, TAB.id);
					});
				})
				: false;
			})
		})
	}

	/* 
	Indicate that the website isn't supported through icon change. 
	*/
	static disable() {
		BrowserIcon.disable();
		BrowserIcon.removeActionListener("onClicked", () => {BrowserIcon.onclick();});

		// Enable icon changes if enabled within the settings. 
		global.read([`settings`, `general`, `showApplicable`]).then((PREFERENCE) => {
			(Tabs.query(null, 0)).then(async (TAB) => {
				(PREFERENCE)
				? BrowserIcon.set({
						"BadgeText": await (new texts(`extensionIcon_website_unsupported`)).symbol,
						"BadgeBackgroundColor": await fetch(CONFIG).then((response) => response.json()).then((jsonData) => {return (jsonData[`N/A`]);})},
					{"tabId": TAB.id})
				: false;
			})
		})
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