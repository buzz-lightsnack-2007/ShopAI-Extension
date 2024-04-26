/* Watchman.js
Be sensitive to changes and update the state.
*/

import filters from "/scripts/filters.js";
import processor from "/scripts/external/processor.js";
import logging from "/scripts/logging.js";
import texts from "/scripts/mapping/read.js";


export default class watchman {
	/* Check the current URL.

		@param {string} URL the page URL; default value is the current webpage
		@return {dictionary} the filter to follow
		*/
	static async observe(URL = window.location.href) {
		// Create the variable to determine the corresponding key.
		let activity = await (new filters).select(URL);

		return activity;
	}

	/* Act on the page.

	@param {dictionary} filters the filter to work with
	@return {boolean} the state
	*/
	static act(matches) {
		// Let user know that the website is supported, if ever they have opened the console. 
		new logging((new texts(`message_external_supported`)).localized);
		// Show loading screen while the load is incomplete. 
		
		
		// Begin only when the page is fully loaded. 
		window.addEventListener(`DOMContentLoaded`, (event) => {
			// Begin processing. 
			let PROC = new processor(matches);
			
			// Remove the loading screen. 
			
		});
	}

	/* Set the program to standby utnil next load.
		*/
	static standby() {
		// Set the icon to indicate that it's not active. 
	}

	static async job() {
		/* The main action. */

		(watchman.observe()).then((RULES) => {
			if (RULES && Object.keys(RULES).length !== 0) {
				watchman.act(RULES);
			} else {
				watchman.standby();
			}
		});
	}
}