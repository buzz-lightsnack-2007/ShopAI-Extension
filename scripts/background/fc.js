/* fc.js
This script provides installation run scripts.
*/

import { template, global, observe } from "../secretariat.js";
import filters from "../filters.js";
let config = chrome.runtime.getURL("config/config.json");

export default class fc {
	// Start the out of the box experience.
	static hello() {
		// the OOBE must be in the config.
		fetch(config)
			.then((response) => response.json())
			.then((jsonData) => {
				let configuration = jsonData[`OOBE`];

				if (configuration) {
					configuration.forEach((item) => {
						chrome.tabs.create({ url: item }, function (tab) {});
					});
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}

	// Initialize the configuration. 
	static setup() {
		// the OOBE must be in the config.
		fetch(config)
			.then((response) => response.json())
			.then(async (jsonData) => {
				let configuration = jsonData;
				
				// Run the storage initialization.
				delete configuration[`OOBE`];
				template.set(configuration);

				// Update the filters to sync with synchronized storage data. 
				(new filters).update();
			})
			.catch((error) => {
				console.error(error);
			});
	}

	static trigger() {
		chrome.runtime.onInstalled.addListener(function (details) {
			(details.reason == chrome.runtime.OnInstalledReason.INSTALL) ? fc.hello() : null;
			fc.setup();
		});
	}

	// main function 
	static run() {
		fc.trigger();
		fc.every();
	}

	static async every() {
		global.read([`settings`,`sync`]).then(async (DURATION_PREFERENCES) => {
			// Forcibly create the preference if it doesn't exist. It's required! 
			if (!(typeof DURATION_PREFERENCES).includes(`obj`) || DURATION_PREFERENCES == null || Array.isArray(DURATION_PREFERENCES)) {
				DURATION_PREFERENCES = {};
				DURATION_PREFERENCES[`duration`] = 24;
	
				// Write it. 
				await global.write([`settings`, `sync`], DURATION_PREFERENCES, -1, {"silent": true});
			};
	
			if (((typeof DURATION_PREFERENCES).includes(`obj`) && DURATION_PREFERENCES != null && !Array.isArray(DURATION_PREFERENCES)) ? ((DURATION_PREFERENCES[`duration`]) ? (DURATION_PREFERENCES[`duration`] > 0) : false) : false) {
				// Convert DURATION_PREFERENCES[`duration`]) from hrs to milliseconds.
				DURATION_PREFERENCES[`duration`] = DURATION_PREFERENCES[`duration`] * (60 ** 2) * 1000;
				let filter = new filters;
	
				// Now, set the interval. 
				let updater_set = () => {
					setInterval(async () => {
						// Update the filters. 
						filter.update();
					}, DURATION_PREFERENCES[`duration`]);
				};
	
				// Provide a way to cancel the interval. 
				let updater_cancel = (updater) => {
					clearInterval(updater);
				};

				let UPDATER = updater_set();

				let updater_interval = async () => {
					
					if ((await global.read([`settings`, `sync`, `duration`])) ? (await global.read([`settings`, `sync`, `duration`] * (60 ** 2) * 1000 != DURATION_PREFERENCES[`duration`])) : false) {
						DURATION_PREFERENCES[`duration`] = await global.global.read([`settings`, `sync`, `duration`]) * (60 ** 2) * 1000;

						// Reset the updater. 
						updater_cancel(UPDATER);
						UPDATER = updater_set();
					}
				};

				observe(updater_cancel);
			};
		})

	};
}
