/* processor.js 
Process the information on the website and display it on screen. 
*/

import scraper from "/scripts/external/scraper.js";
import product from "/scripts/product.js";
import injection from "/scripts/GUI/entrypoints/inject.js"

export default class processor {
	#filter; 
	
	async scrape (fields) {
		this.data = new scraper ((fields) ? fields : this.targets); 
	}
	
	async analyze() {
		this.product = new product(this.data);
		await this.product.attach();
		await this.product.analyze();
		this.product.save();
	}
	
	constructor (filter) {
		this.#filter = filter;

		this.targets = this.#filter[`data`];
		this.scrape();

		if ((this.data) ? (((typeof (this.data)).includes(`obj`) && !Array.isArray(this.data)) ? Object.keys(this.data) : this.data) : false) {
			this.analyze();

		}
		
	}
}