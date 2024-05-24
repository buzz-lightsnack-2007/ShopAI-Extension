/* net.js
	This script provides network utilities.
*/

import texts from "/scripts/mapping/read.js";
import logging from "/scripts/logging.js";

export default class net {
	/*
	Download a file from the network or locally.

	@param {string} URL the URL to download
	@param {string} TYPE the expected TYPE of file
	@param {boolean} VERIFY_ONLY whether to verify the file only, not return its content
	@param {boolean} STRICT strictly follow the file type provided
	@returns {Promise} the downloaded file
	*/
	static async download(URL, TYPE, VERIFY_ONLY = false, STRICT = false) {
		let CONNECT, DATA;
		let HEADERS = {};

		// If TYPE is used as headers, then the other parts of the header should be taken out for later usage.
		if (TYPE && (typeof TYPE).includes(`obj`)) {
			HEADERS = TYPE;
			TYPE = HEADERS[`Content-Type`];
		}

		try {
			// Fetch the file. Add headers when defined.
			(Object.keys(HEADERS).length) ? CONNECT = await fetch(URL, {method: `POST`, headers: HEADERS}) : CONNECT = await fetch(URL);

			if (CONNECT.ok && !VERIFY_ONLY) {
				DATA = await CONNECT[(TYPE.toLowerCase().includes('blob')) ? `blob` : `text`]();

				if (TYPE
						? (TYPE.toLowerCase().includes(`json`) || TYPE.toLowerCase().includes(`dictionary`))
						: false) {
					try {
						DATA = JSON.parse(DATA);
					} catch(err) {
						// When not in JSON, run this.
						if (STRICT) {
							// Should not allow the data to be returned since it's not correct.
							DATA = null;
							throw err;
						} else {
							logging.warn(texts.localized(`error_msg_notJSON`, false));
						}
					};
				};
			} else if (!CONNECT.ok) {
				throw new ReferenceError();
			}
		} catch(err) {
			throw err;
		}

		// Return the filter.
		return VERIFY_ONLY ? CONNECT.ok : DATA;
	}
}
