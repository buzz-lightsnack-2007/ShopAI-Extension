/* fc.js
This does not stand for "FamiCom" but instead on Finalization and Completion. This script provides installation run scripts.
*/

import {read, write, init} from './secretariat.js';

let config = chrome.runtime.getURL('config/config.json');

export default class fc {

	static hello() {
		/* Start the out of the box experience.
		*/

		// the OOBE must be in the config.
		fetch(config)
			.then((response) => response.json())
			.then((jsonData) => {
				let configuration = jsonData[`OOBE`];

				if (configuration) {
	 				configuration.forEach((item) => {
						chrome.tabs.create({ url: item }, function(tab) {});
					});
				};
			})
			.catch((error) => {
					console.error(error);
			});
	};

	static setup() {
		/* Initialize the configuration.

		Returns: the initialization result
		*/

		// the OOBE must be in the config.
		fetch(config)
			.then((response) => response.json())
			.then((jsonData) => {
				let configuration = jsonData[`settings`];

				// Run the storage initialization.
				init(configuration);
			})
			.catch((error) => {
					console.error(error);
			});
	}

	static trigger() {
		chrome.runtime.onInstalled.addListener(function (details) {
			if (details.reason == chrome.runtime.OnInstalledReason.INSTALL) {
				fc.hello();
			};
			fc.setup();
		});
	}

	static run() {
		/* main function */

		fc.trigger();
	}
}
