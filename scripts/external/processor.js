/* processor.js 
Process the information on the website and display it on screen. 
*/

import scraper from "/scripts/external/scraper.js";
import product from "/scripts/data/product.js";
import {global} from "/scripts/secretariat.js";
import logging from "/scripts/logging.js";

export default class processor {
	#filter; 
	
	async scrape (fields) {
		this.data = new scraper ((fields) ? fields : this.targets); 
	}
	
	async analyze() {
		this.product = new product(this.data);
		await this.product.attach();
		try {
			await this.product.analyze();
		} catch(err) {
			logging.error(err.name, err.message, err.stack, false);
			this.product.status[`error`] = true;
		};

		// Indicate that the process is done. 
		this.product.status[`done`] = true;

		// Save the data. 
		this.product.save();
	}
	
	constructor (filter, URL = window.location.href) {
		const clean = (URL) => {
			// Remove the protocol from the URL.
			return((URL.replace(/(^\w+:|^)\/\//, ``).split(`?`))[0]);
		}

		this.URL = clean(URL);
		this.#filter = filter;

		this.notify();

		this.targets = this.#filter[`data`];
		this.scrape();

		if ((this.data) ? (((typeof (this.data)).includes(`obj`) && !Array.isArray(this.data)) ? Object.keys(this.data) : this.data) : false) {
			this.analyze();
		}
	}
}