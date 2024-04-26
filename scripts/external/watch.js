/* Watchman.js
Be sensitive to changes and update the state.
*/

import check from "/scripts/external/check.js";
import processor from "/scripts/external/processor.js";
import logging from "/scripts/logging.js";
import texts from "/scripts/mapping/read.js";


export default class watchman {
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

	static job() {
		/* The main action. */

		(check.platform()).then((RULES) => {
			console.log(RULES);
			if (RULES && Object.keys(RULES).length !== 0) {
				watchman.act(RULES);
			} else {
				watchman.standby();
			}
		});
	}
}