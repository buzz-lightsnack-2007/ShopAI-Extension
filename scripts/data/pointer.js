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
}

export {pointer as default};
