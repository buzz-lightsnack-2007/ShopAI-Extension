/* 
BackgroundImporter
This script provides installation run scripts.
*/

// File importation
import {template, global} from "../secretariat.js";
import pointer from "../data/pointer.js";
import {URLs} from "../utils/URLs.js";
import net from "../utils/net.js";

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
				
				if ((configuration) ? Object.keys(configuration).length : false) {
					// Run the storage initialization.
					delete configuration[`OOBE`];
				
					// Replace local URLs of filters to corresponding chrome extension pages.
					const checkURL = async () => {
						if (((typeof configuration[`settings`][`filters`]).includes(`obj`) && configuration[`settings`][`filters`]) ? Object.keys(configuration[`settings`][`filters`]).length : false) {
							let FILTERS = {};
							FILTERS[`current`] = configuration[`settings`][`filters`];
							FILTERS[`updated`] = {};
							
							for (let FILTER_NUMBER = 0; FILTER_NUMBER < Object.keys(FILTERS[`current`]).length; FILTER_NUMBER++) {
								let SOURCE = Object.keys(FILTERS[`current`])[FILTER_NUMBER];
								
								// Check if the URL is invalid. 
								if (!(URLs.test(SOURCE))) {
									// Set the URL. 
									let ORIGIN = {"raw": SOURCE};
								
									// If it is, it's most likely located within the extension. 
									ORIGIN[`local`] = chrome.runtime.getURL(`config/filters/`.concat(ORIGIN[`raw`]));
								
									// Attempt to verify the existence of the file. 
									if (await net.download(ORIGIN[`local`], `json`, true)) {
										FILTERS[`updated`][ORIGIN[`local`]] = FILTERS[`current`][ORIGIN[`raw`]];
									};	
								} else {
									FILTERS[`updated`][SOURCE] = FILTERS[`current`][SOURCE];
								};
							};
							configuration[`settings`][`filters`] = FILTERS[`updated`];
							return(FILTERS[`updated`]);
						};
					};
					await checkURL();
					
					// Set the template. 
					template.set(configuration);
					await global.write([`ready`], true, -1);
				};
			})
			.catch((error) => {
				console.error(error);
			});
	};
	
	trigger() {
		chrome.runtime.onInstalled.addListener((details) => {
			(details.reason == chrome.runtime.OnInstalledReason.INSTALL) ? this.hello() : null;
			this.setup();
		});
	};

	// main function 
	constructor () {
		this.trigger();

		// Might as well set the preferences for storage. 
		template.configure();
		pointer.clear();
	}
}
