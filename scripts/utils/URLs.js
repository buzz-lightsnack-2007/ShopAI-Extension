/*
URL tools
*/

class URLs {
	/*
	Remove the protocol from the URL.

	@param {string} URL the URL to clean
	*/
	static clean(URL) {
		return((URL.trim().replace(/(^\w+:|^)\/\//, ``).split(`?`))[0]);
	}

	/*
	Check if the URL is valid through checking its patterns. 
	
	@param {string} location the URL to check
	@return {boolean} the state
	*/
	static test(location) {
		let STATE = false;
		
		// Convert to URL object.
		try {
			STATE = !!(new URL(location));
		} catch(err) {
			STATE = false;
		}

		return STATE;
	}
}

export {URLs};