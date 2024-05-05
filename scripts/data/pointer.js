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
		return((URL) ? global.write([`last`], URL, -1) : null); 
		
	}

	/*
	Update the state of the pointer.

	@param {dictionary} state the new state
	*/
	static async update(state) {
		// Indicate the status of the process.
		if ((state && (typeof state).includes(`obj`)) ? Object.keys(state).length : false) {
			if (state[`URL`]) {
				await this.select(state[`URL`]);
				delete state[`URL`];
			};

			(await global.read([`last`]))
				? (Object.keys(state)).forEach(async (key) => {
					await global.write([`sites`, await global.read([`last`]), key], state[key], -1);
				})
				: false;
		}
	}

	/*
	Read a property about the pointer. 

	@param {string} name the property to read
	*/
	static async read(name) {
		let RETURN = ((name)
			? (!(name.trim().includes(`URL`))
				? await global.read([`last`])
				: true)
			: false)
			? global.read((name.trim().includes(`URL`))
				? [`last`]
				: [`sites`, await global.read([`last`]), ...((Array.isArray(name)) ? name : name.trim().split(`,`))]) 
			: null;
		return(RETURN);
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
