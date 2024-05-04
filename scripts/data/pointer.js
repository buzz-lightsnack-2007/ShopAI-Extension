/* pointer.js

Change the currently selected data to be viewed by the popup.  
*/

import {global} from "/scripts/secretariat.js";

class pointer {
	/*
	Select a URL to view. 
	*/
	static select(URL) {
		const clean = (URL) => {
			// Remove the protocol from the URL.
			return((URL.replace(/(^\w+:|^)\/\//, ``).split(`?`))[0]);
		}
		
		try {
			URL = (!URL) ? window.location.href : ((URL && (typeof URL).includes(`str`)) ? clean(URL) : null); 
		} catch(err) {}

		// Get the last edited site. 
		return(global.write([`last`, `URL`], this.URL, -1));
	}

	/*
	Update the state of the pointer.

	@param {dictionary} state the new state
	*/
	static update(state) {
		// Indicate the status of the process.
		if ((state && (typeof state).includes(`obj`)) ? Object.keys(state).length : false) {
			(Object.keys(state)).forEach(async (key) => {
				await global.write([`last`, key], state[key], -1);
			});
		}
	}

	static read() {
		return(global.read([`last`]));
	}

	/* 
	Clear the pointer. 

	@param {boolean} silent don't request a response.
	*/
	static clear(silent = true) {
		return (global.forget([`last`], 0, silent))
	}
}

export {pointer as default};
