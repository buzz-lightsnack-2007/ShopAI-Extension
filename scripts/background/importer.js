/* 
BackgroundImporter
This script provides installation run scripts.
*/

// File importation
import {template, global} from "../secretariat.js";
import pointer from "../data/pointer.js";

// The URL for the configuration file
const config = chrome.runtime.getURL("config/config.json");

export default class BackgroundImporter {
	// Start the out of the box experience.
	async hello() {
		if (!(await global.read([`init`])) || !(await global.read([`settings`,`analysis`,`api`,`key`]))) {
			let SOURCE = fetch(config); 
			let SITES = [`popup/hello.htm`];
	
			if (SOURCE.ok) {
				try {
					let CONFIGURATION = await SOURCE.json();
					if (CONFIGURATION[`OOBE`]) {
						SITES = [...SITES, ...(Array.isArray(CONFIGURATION[`OOBE`]) ? CONFIGURATION[`OOBE`] : [CONFIGURATION[`OOBE`]])];
					};
				} catch(err) {}
			};
			
			SITES.forEach((item) => {
				// Get local URL. 
				chrome.tabs.create({ url: chrome.runtime.getURL('pages/'.concat(item)) }, function (tab) {});
			});
		};
	};

	// Initialize the configuration. 
	setup() {
		// the OOBE must be in the config.
		fetch(config)
			.then((response) => response.json())
			.then(async (jsonData) => {
				let configuration = jsonData;
				
				// Run the storage initialization.
				delete configuration[`OOBE`];
				template.set(configuration);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	trigger() {
		chrome.runtime.onInstalled.addListener((details) => {
			(details.reason == chrome.runtime.OnInstalledReason.INSTALL) ? this.hello() : null;
			this.setup();
		});
	}

	// main function 
	constructor () {
		this.trigger();

		// Might as well set the preferences for storage. 
		template.configure();
		pointer.clear();
	}
}
