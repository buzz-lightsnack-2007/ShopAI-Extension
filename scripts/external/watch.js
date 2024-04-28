/* Watchman.js
Be sensitive to changes and update the state.
*/

import check from "/scripts/external/check.js";
import processor from "/scripts/external/processor.js";
import logging from "/scripts/logging.js";
import texts from "/scripts/mapping/read.js";
import {read} from "/scripts/secretariat.js";

export default class watch {
	/* Open relevant graphical user interfaces. 
	*/
	static callGUI() {
		// Open the side panel if set by default. 
		read([`settings`,`behavior`,`autoOpen`]).then((result) => {
			if (result) {chrome.runtime.sendMessage('sidebar_open')};
		});
	}

	/* Act on the page.

	@param {dictionary} filter the filter to work with
	*/
	static process(filter) {
		// Let user know that the website is supported, if ever they have opened the console. 
		new logging((new texts(`message_external_supported`)).localized);

		// Begin only when the page is fully loaded. 
		window.addEventListener(`DOMContentLoaded`, (event) => {
			// Begin processing. 
			let PROC = new processor(filter);
		});
	}

	static main() {
		/* The main action. */
		(check.platform()).then((RULES) => {
			if (RULES && Object.keys(RULES).length > 0) {
				watchman.process(RULES);
				watchman.callGUI();
			}
		});
	}
}