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
	
	async scrape (fields) {
		this.product.details = new scraper ((fields) ? fields : this.targets); 

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
		this.product.status[`done`] = 1;

		// Save the data. 
		this.product.save();
	};

	/*
	Run in the chronological order. Useful when needed to be redone manually. 
	*/
	async run (options = {}) {
		this.product.status[`done`] = (this.targets) ? .25 : 0;

		// Scrape the data. 
		await this.scrape();
		
		if ((this.product.details) ? Object.keys(this.product.details).length : false) {
			this.product.status[`done`] = .5;
			this.analyze((options && (typeof options).includes(`obj`)) ? options[`analysis`] : null);
		};
	}

	constructor (filter, URL = window.location.href, options = {}) {
		this.URL = URLs.clean(URL);
		this.#filter = filter;

		this.product = new product();
		this.targets = this.#filter[`data`];
		
		((((typeof options).includes(`obj`)) ? Object.hasOwn(options, `automatic`) : false) ? options[`automatic`] : true) ? this.run() : false;
	}
}