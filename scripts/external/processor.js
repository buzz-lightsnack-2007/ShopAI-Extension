/* processor.js 
Process the information on the website and display it on screen. 
*/

import scraper from "/scripts/external/scraper.js";
import product from "/scripts/data/product.js";
import {global} from "/scripts/secretariat.js";
import logging from "/scripts/logging.js";
import {URLs} from "/scripts/utils/URLs.js";

export default class processor {
	#filter; 
	
	async scrape (fields, options) {
		this.product.details = new scraper (((fields) ? fields : this.targets), options); 

		// Read product data and gather the SHA512 hash. 
		await this.product.read();
		
		// Save the details already. 
		return(await this.product.save());
	}
	
	async analyze(options = {}) {
		// Set up current data of the site, but forget about its previous errored state. 
		delete this.product.status[`error`];

		// Set the completion state to anything else but not 1. 
		this.product.status[`done`] = (this.product.status[`done`] == 1) ? 0 : this.product.status[`done`];

		// Save this information. 
		this.product.save();

		// Try analysis of the data.
		try {
			await this.product.analyze(options);
		} catch(err) {
			// Use the existing error if there exists any. 
			this.product.status[`error`] = (this.product.status[`error`]) ? this.product.status[`error`] : {};

			(this.product.status[`error`]) ? false
			:  [`name`, `message`, `stack`].forEach((KEY) => {
				this.product.status.error[KEY] = String(err[KEY]);
			});
			logging.error(err);
			logging.error(this.product.status[`error`].name, this.product.status[`error`].message, this.product.status[`error`].stack);
		};

		// Indicate that the process is done. 
			this.#notify(1);

		// Save the data. 
		this.product.save();
	};

	/*
	Run in the chronological order. Useful when needed to be redone manually. 
	*/
	async run (options = {}) {
		this.#notify((this.targets) ? .25 : 0);

		// Scrape the data. 
		await this.scrape();
		
		if ((this.product.details) ? Object.keys(this.product.details).length : false) {
			// Update the status. 
			await this.#notify(.5);

			// Analyze the data.
			this.analyze((options && (typeof options).includes(`obj`)) ? options[`analysis`] : null);
		};
	}

	/*
	Update the percentage of the progress. 
	
	@param {number} status the status of the progress
	*/
	async #notify (status) {
		this.status[`done`] = status;

		// Set the status of the site.
		if (await global.write([`sites`, this.URL, `status`], this.status, -1)) {
			// Set the status to its whole number counterpart. 
			let STATUS = Math.round(status * 100);
			
			// Get the corresponding status message. 
			new logging(texts.localized(`scrape_msg_`.concat(String(STATUS))), (String(STATUS)).concat("%"));
			return true;
		} else {
			return false;
		}
	};

	constructor (filter, URL = window.location.href, options = {}) {
		this.URL = URLs.clean(URL);
		this.#filter = filter;

		this.product = new product();
		this.targets = this.#filter[`data`];

		this.status = {};
		
		((((typeof options).includes(`obj`)) ? Object.hasOwn(options, `automatic`) : false) ? options[`automatic`] : true) ? this.run() : false;
	}
}