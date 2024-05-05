/* Watchman.js
Be sensitive to changes and update the state.
*/

import check from "/scripts/external/check.js";
import processor from "/scripts/external/processor.js";
import logging from "/scripts/logging.js";
import texts from "/scripts/mapping/read.js";
import {global} from "/scripts/secretariat.js";

export default class watch {
	/* Open relevant graphical user interfaces. 
	*/
	static callGUI() {
		
	}

	/* Act on the page.

	@param {dictionary} filter the filter to work with
	*/
	static async process(filter) {
		document.onreadystatechange = async () => {
			if (document.readyState == 'complete' && await global.read([`settings`, `behavior`, `autoRun`])) {
				new logging((new texts(`scrape_msg_ready`)).localized);
				let PROC = new processor(filter);
			}
		};
	}

	static main() {
		(check.platform()).then((FILTER_RESULT) => {
			if (FILTER_RESULT && Object.keys(FILTER_RESULT).length > 0) {
				// Let user know that the website is supported, if ever they have opened the console. 
				new logging((new texts(`message_external_supported`)).localized);

				watch.process(FILTER_RESULT);
				watch.callGUI();
				
				// Create a listener for messages indicating re-processing. 
				chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
					(((typeof message).includes(`obj`) && !Array.isArray(message)) ? message[`refresh`] : false) ? watch.process(FILTER_RESULT) : false;
				});
			}
		});

	}
}