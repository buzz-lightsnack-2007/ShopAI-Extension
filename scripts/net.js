/* net.js
	This script provides network utilities.
*/

/*
Download a file from the network or locally.

@param {string} URL the URL to download
@param {string} TYPE the expected TYPE of file
@param {boolean} VERIFY_ONLY whether to verify the file only, not return its content
@param {boolean} STRICT strictly follow the file type provided
@returns {Promise} the downloaded file
*/
export default class net {
	static async download(URL, TYPE, VERIFY_ONLY = false, STRICT = false) {
		const texts = (await import(chrome.runtime.getURL(`gui/scripts/read.js`)))
			.default;
		const alerts = (await import(chrome.runtime.getURL(`gui/scripts/alerts.js`))).default;
	
		let CONNECT, DATA; 
	
		try {
			CONNECT = await fetch(URL);
	
			if (CONNECT.ok && !VERIFY_ONLY) {
				DATA = await CONNECT.text();
			
				if (
					TYPE
						? TYPE.toLowerCase().includes(`json`) || TYPE.toLowerCase().includes(`dictionary`)
						: false
				) {
					try {
					DATA = JSON.parse(DATA);
					// When not in JSON, run this.
					} catch(err) {
						if (STRICT) {
							// Should not allow the data to be returned since it's not correct. 
							DATA = null;
							throw new TypeError(texts.localized(`error_msg_notJSON`, false));
						} else {alerts.warn(texts.localized(`error_msg_notJSON`, false));}
					};
				};
			}
		} catch(err) {
			throw err;
		}
	
		// Return the filter.
		return VERIFY_ONLY ? CONNECT.ok : DATA;
	}
}
