/* ask.js
Ask product information to Google Gemini. */

// Import the storage management module.
import {global, session, compare} from "/scripts/secretariat.js";
import hash from "/scripts/utils/hash.js";
import texts from "/scripts/mapping/read.js";
import logging from "/scripts/logging.js";

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
		if (!((typeof options).includes(`obj`) && !Array.isArray(options) && options != null)) {
			options = {};
		}

		/* Remove uneeded data or formatting from the URL and the data. */
		let clean = (URL) => {
			// Remove the protocol from the URL.
			return((URL.replace(/(^\w+:|^)\/\//, ``).split(`?`))[0]);
		}

		// Set this product's details as part of the object's properties.
		this.URL = clean(URL);
		this.details = details;

		// Set private variables.
		this.#options = options;
	};

	/* Attach the product data to the storage. */
	async attach() {
		// Add the data digest.
		this.#snip = (await hash.digest(this.details, {"output": "Array"}));

		// Add the status about this data.
		this.status = {};
		this.status[`update`] = !(await (compare([`sites`, this.URL, `snip`], this.#snip)));
	}

	async save() {
		// Stop when not attached (basically, not entirely initialized).
		if (!this.#snip) {throw new ReferenceError((new texts(`error_msg_notattached`)).localized)};

		// Write the data to the session storage, indicating that it is the last edited. 
		(this[`analysis`]) ? await session.write([`sites`, this.URL, `analysis`], this.analysis) : false;

		// There is only a need to save the data if an update is needed. 
		if (this.status[`update`]) {
			// Save the data to the storage.
			await global.write([`sites`, this.URL, `snip`], this.#snip, 1);
	
			// Write the analysis data to the storage.
			(this[`analysis`]) ? global.write([`sites`, this.URL, `analysis`], this.analysis, 1): false;
		}

	};

	async analyze() {
		// Stop when the data is already analyzed.
		if (this[`analysis`]) {return(this.analysis)}
		else if (this.status ? (!this.status.update) : false) {this.analysis = await global.read([`sites`, this.URL, `analysis`]);}
		if ((this.analysis && this.analysis != null && this.analysis != undefined) ? !((typeof this.analysis).includes(`obj`) && !Array.isArray(this.analysis)) : true) {
			// Analyze the data.
			const gemini = (await import(chrome.runtime.getURL("scripts/AI/gemini.js"))).default;
			let analyzer = new gemini (await global.read([`settings`,`analysis`,`api`,`key`]), `gemini-pro`);

			// Analyze the data.
			let PROMPT = [];

			// Add the prompt.
			PROMPT.push({"text": ((new texts(`AI_message_prompt`)).localized).concat(JSON.stringify(this.details))});

			try {
				
				// Run the analysis.
				await analyzer.generate(PROMPT);

				// Raise an error if the product analysis is blocked. 
				if (analyzer.blocked) {
					throw new Error((new texts(`error_msg_blocked`)).localized)
				};

				if (analyzer.candidate) {
					// Remove all markdown formatting.
					this.analysis = JSON.parse(analyzer.candidate.replace(/(```json|```|`)/g, ''));
				};
			} catch(err) {
				await session.write([`sites`, this.URL, `error`], err, 1);
				throw err;
			}
		};

		return(this.analysis);
	};
};
