/* Watchman.js
Be sensitive to changes and update the state.
*/

import check from "/scripts/external/check.js";
import processor from "/scripts/external/processor.js";
import logging from "/scripts/logging.js";
import texts from "/scripts/mapping/read.js";
import {global} from "/scripts/secretariat.js";

export default class watch {
	/* Act on the page.

	@param {object} filter the filter to work with
	@param {object} options the options
	*/
	static async process(filter, options = {}) {
		document.onreadystatechange = async () => {
			if (document.readyState == 'complete' && (await global.read([`settings`, `behavior`, `autoRun`]) || ((((typeof options).includes(`object`) && options) ? Object.hasOwn(options, `override`) : false) ? options[`override`] : false))) {
				new logging((new texts(`scrape_msg_ready`)).localized);
				this.processed = (((options && typeof options == `object`) ? options[`override`] : false) || this.processed == null) ? new processor(filter) : this.processed;
			}
		}
	}

	static main() {
		(check.platform()).then((FILTER_RESULT) => {
			if (FILTER_RESULT && Object.keys(FILTER_RESULT).length > 0) {
				// Let user know that the website is supported, if ever they have opened the console. 
				new logging((new texts(`message_external_supported`)).localized);

				watch.process(FILTER_RESULT);
				
				// Create a listener for messages indicating re-processing. 
				chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
					(((typeof message).includes(`obj`) && !Array.isArray(message)) ? message[`refresh`] : false) ? watch.process(FILTER_RESULT, {"override": true}) : false;
				});
			}
		});

	}
}