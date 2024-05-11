/* Watchman.js
Be sensitive to changes and update the state.
*/

import check from "/scripts/external/check.js";
import processor from "/scripts/external/processor.js";
import logging from "/scripts/logging.js";
import texts from "/scripts/mapping/read.js";
import {global} from "/scripts/secretariat.js";
import {URLs} from "/scripts/utils/URLs.js";
import pointer from "/scripts/data/pointer.js";

export default class watch {
	static async main() {
		let FILTER_RESULT = await check.platform();

		if (FILTER_RESULT && Object.keys(FILTER_RESULT).length > 0) {
			// Let user know that the website is supported, if ever they have opened the console. 
			new logging((new texts(`message_external_supported`)).localized);

			watch.process(FILTER_RESULT);
		}
	}

	/* Act on the page.

	@param {object} filter the filter to work with
	@param {object} options the options
	*/
	static async process(filter) {
		let LOCATION = URLs.clean(window.location.href);
		let PROCESSOR = new processor(filter, LOCATION, {"automatic": false});
		global.forget([`sites`, LOCATION, `status`], 0, true);

		const perform = (options) => {
			(document.readyState == `complete`) ? PROCESSOR.run(options) : document.onreadystatechange = async () => {(document.readyState == `complete`) ? PROCESSOR.run(options) : PROCESSOR.status.done = .125;};
		}

		(await global.read([`settings`, `behavior`, `autoRun`]) || await pointer.read([`status`, `error`])) ? document.onreadystatechange = async () => {perform(((await pointer.read([`status`, `error`])) ? {"override": true} : null));} : false;

		// Create a listener for messages indicating re-processing. 
		chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
			if (((typeof message).includes(`obj`) && !Array.isArray(message)) ? message[`refresh`] : false) {
				perform((message[`refresh`] == `manual`) ? {"analysis": {"override": true}} : null);
			};
		});
	};
}