/* ask.js
Ask product information to Google Gemini. */

// Import the storage management module.
import {global, compare} from "/scripts/secretariat.js";
import hash from "/scripts/utils/hash.js";
import {URLs} from "/scripts/utils/URLs.js";

// Don't forget to set the class as export default.
export default class product {
	// Create private variables for explicit use for the storage.
	#options = {};

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
			this.snip = (await hash.digest(this.details, {"output": "Array"}));

			// Add the status about this data.
			this.status[`update`] = !(await (compare([`sites`, this.URL, `snip`], this.snip)));
		};

		if ((!this.status.update && Object.hasOwn(this.status, `update`)) && !this.analysis) {
			let DATA = await global.read([`sites`, this.URL, `analysis`]);
			(DATA) ? this.analysis = DATA : false;
		};
	}

	async save(options = {}) {
		// Set the default options.
		options = Object.assign({}, this.#options, options);

		// There is only a need to save the data if an update is needed.
		if ((Object.hasOwn(this.status, `update`) ? this.status[`update`] : true) || options[`override`]) {
			let STATUS = true;

			// Save the data.
			Object.keys(this).forEach(async (KEY) => {
				if ((!([`#options`, `status`, `details`].includes(KEY))) && STATUS) {
					STATUS = await global.write([`sites`, this.URL, KEY], this[KEY], 1, {"override": true});
				};
			});

			return (STATUS);
		};
	};
};
