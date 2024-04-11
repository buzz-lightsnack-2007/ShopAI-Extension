/* ask.js
Ask product information to Google Gemini. */

// Import the storage management module.
const secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));
const texts = (await import(chrome.runtime.getURL("scripts/read.js"))).default;

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
		if (!(typeof(options).includes(`obj`) && !Array.isArray(options) && options != null)) {
			options = {};
		}

		/* Remove uneeded data or formatting from the URL and the data. */
		let clean = (URL) => {
			// Remove the protocol from the URL. 
			return(URL.replace(/(^\w+:|^)\/\//, ``).split(`?`));
		}

		// Compare a digested data to its intended storage location. 
		function compare(URL, DATA) {
			let RESULT = secretariat.read([`sites`, URL]).then((DATA_STORED) => {
				if (DATA_STORED) {
					return (DATA_STORED == digest(DATA, options));
				};
			});

			return(RESULT);
		}; 

		

		// Set this product's details as part of the object's properties. 
		this.URL = clean(URL);
		this.details = details;

		// Set private variables.
		this.#options = options;
	};

	/* Attach the product data to the storage. */
	async attach() {
		// First get the hash of this data. 
		const digest = async (DATA, OPTIONS) => {
			DATA = {"raw": DATA};
			DATA[`hashed`] = await(crypto.subtle.digest(((OPTIONS != null && typeof(OPTIONS).includes(`obj`) && !Array.isArray(OPTIONS)) ? OPTIONS[`digestion`] : false) ? OPTIONS[`digestion`] : "SHA-512", (new TextEncoder()).encode(DATA[`raw`])));
			return (DATA[`hashed`]);	
		};

		
		// Compare. 
		const compare = async(URL, digest) => {
			let RESULT = await secretariat.read([`sites`, URL, `data`]);
			
			return ((RESULT) ? (RESULT == digest) : false);
		};
		
		
		// Add the data digest. 
		this.#snip = digest(this.details, this.#options);
		
		// Add the status about this data. 
		this.status = {};
		this.status[`update`] = !compare(this.URL, this.#snip);
	}
	
	async save() {
		// Stop when not attached (basically, not entirely initialized). 
		if (!this.#snip) {throw new ReferenceError(texts.localized(`error_msg_notattached`))};

		// Save the data to the storage.
		secretariat.write([`sites`, this.URL, `data`], this.#snip);

		// Write the analysis data to the storage. 
		(this[`analysis`]) ? secretariat.write([`sites`, this.URL, `analysis`], this.analysis): false;
	};

	async analyze() {
		// Stop when the data is already analyzed.
		if (this[`analysis`]) {return(this.analysis)}
		else if (this.status ? (!this.status.update) : false) {this.analysis = await secretariat.read([`sites`, this.URL, `analysis`]);}
		else {
			// Analyze the data. 
			const gemini = (await import(chrome.runtime.getURL("scripts/AI/gemini.js"))).default;
			let analyzer = new gemini (await secretariat.read([`settings`,`analysis`,`api`,`key`]), `gemini-pro`);
			
			// Analyze the data. 
			await analyzer.generate(this.details);
	
			// Return the analysis
			this.analysis = analyzer.response;
		}

		return(this.analysis);
	};
};
