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
		
	}

	/* Act on the page.

	@param {dictionary} filter the filter to work with
	*/
	static process(filter) {
		// Let user know that the website is supported, if ever they have opened the console. 
		new logging((new texts(`message_external_supported`)).localized);

		// Begin only when the page is fully loaded. 
		document.onreadystatechange = () => {
			if (document.readyState == 'complete') {
				let PROC = new processor(filter);
			}
		};
	}

	static main() {
		(check.platform()).then((FILTER_RESULT) => {
			if (FILTER_RESULT && Object.keys(FILTER_RESULT).length > 0) {
				watch.process(FILTER_RESULT);
				watch.callGUI();
				
				// Create a listener for messages indicating re-processing. 
				chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
					// Get the tabId where this content script is running. 
					

					(((typeof message).includes(`obj`) && !Array.isArray(message)) ? message[`refresh`] : false) ? watch.process(FILTER_RESULT) : false;
				});
			}
		});

	}
}