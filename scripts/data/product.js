/* ask.js
Ask product information to Google Gemini. */

// Import the storage management module.
import {global, session, compare} from "/scripts/secretariat.js";
import hash from "/scripts/utils/hash.js";
import texts from "/scripts/mapping/read.js";
import logging from "/scripts/logging.js";
import {URLs} from "/scripts/utils/URLs.js";

// Don't forget to set the class as export default.
export default class product {
	// Create private variables for explicit use for the storage.
	#snip;
	#options;

	/* Initialize a new product with its details.

	@param {object} details the product details
	@param {object} URL the URL
	@param {object} options the options
	*/
	constructor (details, URL = window.location.href, options) {
		options = (!((typeof options).includes(`obj`) && !Array.isArray(options) && options != null))
			? {}
			: options;

		// Set this product's details as part of the object's properties.
		(URL) ? this.URL = URLs.clean(URL) : false;
		this.details = details;

		// Set private variables.
		this.#options = options;

		// Set the status. 
		this.status = {};
	};

	/*
	Check the data with data from the storage. 
	*/
	async read() {
		if (this.details) {
			// Add the data digest.
			this.#snip = (await hash.digest(this.details, {"output": "Array"}));
	
			// Add the status about this data.
			this.status[`update`] = !(await (compare([`sites`, this.URL, `snip`], this.#snip)));
		};

		if (!this.status.update && Object.hasOwn(this.status, `update`)) {this.analysis = await global.read([`sites`, this.URL, `analysis`]);};
	}

	async save() {
		// Save the status to the storage. This might be needed since it's also a signalling method. 
		await global.write([`sites`, this.URL, `status`], this.status, -1, {"strict": true});

		// There is only a need to save the data if an update is needed. 
		if (Object.hasOwn(this.status, `update`) ? this.status[`update`] : true) {	
			// Save the snip data. 
			(this.#snip) ? await global.write([`sites`, this.URL, `snip`], this.#snip, 1) : false;
	
			// Write the analysis data to the storage.
			return((this[`analysis`]) ? global.write([`sites`, this.URL, `analysis`], this.analysis, 1) : false);
		}
	};

	async analyze(options = {}) {
		// Stop when the data is already analyzed.
		if (((this.analysis && this.analysis != undefined) ? !((typeof this.analysis).includes(`obj`) && !Array.isArray(this.analysis)) : true) || ((options && (typeof options).includes(`obj`)) ? options[`override`] : false)) {
			const gemini = (await import(chrome.runtime.getURL("scripts/AI/gemini.js"))).default;
			let analyzer = new gemini (await global.read([`settings`,`analysis`,`api`,`key`]), `gemini-pro`);
			
			// Add the prompt.
			let PROMPT = [];
			PROMPT.push({"text": ((new texts(`AI_message_prompt`)).localized).concat(JSON.stringify(this.details))});
			
			// Run the analysis.
			await analyzer.generate(PROMPT);

			// Raise an error if the product analysis is blocked. 
			this.status[`blocked`] = analyzer.blocked;
			if (this.status[`blocked`]) {
				this.status.error = {"name": (new texts(`blocked`)).localized, "message": (new texts(`error_msg_blocked`)).localized, "stack": analyzer.response};
				throw new Error((new texts(`error_msg_blocked`)).localized)
			};

			if (analyzer.candidate) {
				// Remove all markdown formatting.
				this.analysis = JSON.parse(analyzer.candidate.replace(/(```json|```|`)/g, ''));
			};
			
		};

		return(this.analysis);
	};
};
