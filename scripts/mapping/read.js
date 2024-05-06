/* read_universal
	Read a file stored in the universal strings. */

import logging from "/scripts/logging.js";

export default class texts {
	/* This reads the message from its source. This is a fallback for the content scripts, who doesn't appear to read classes.

	@param {string} message the message name
	@param {boolean} autofill fill in the message with the template name when not found
	@param {list} params the parameters
	@return {string} the message
	*/

	constructor(message_name, autofill = false, params = []) {
		[`localized`, `symbol`].forEach((SOURCE) => {
			this[SOURCE] = texts[SOURCE](message_name, autofill, params);
			
			// When the message is not found, return the temporary text.
			(!this[SOURCE] && !autofill) ? delete this[SOURCE] : false;
		});
		
	}

	static localized(message_name, autofill = false, params = []) {
		let MESSAGE = (params && (params ? params.length > 0 : false))
			? chrome.i18n.getMessage(message_name, params)
			: chrome.i18n.getMessage(message_name);

		// When the message is not found, return the temporary text.
		(!MESSAGE && autofill) 
			? MESSAGE = message_name
			: false;

		return (MESSAGE);
	}
	
	/*
	Look for a symbol. 
	
	@param {string} message_name the symbol name
	@param {bool} autofill use the message name if the message is not found
	@param {object} params the parameters
	*/
	static symbol(message_name, autofill = false, params = []) {
		const CONFIG = chrome.runtime.getURL("media/config.symbols.json");
		return (fetch(CONFIG)
			.then((response) => response.json())
			.then((jsonData) => {
				let SYMBOL = (autofill) ? message_name : null;
				
				(jsonData[message_name])
					? SYMBOL = jsonData[message_name][`symbol`]
					: false;
				
				return (SYMBOL);
			})
			.catch((error) => {
				logging.error(error.name, null, null, false);
			}));
	};
}

export function read(message_name, autofill, params) {
	return (texts.localized(message_name, autofill, params));
}
