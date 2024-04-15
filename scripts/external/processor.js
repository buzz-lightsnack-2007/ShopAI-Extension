/* processor.js 
Process the information on the website and display it on screen. 
*/

// const inject = ((await import(chrome.runtime.getURL("scripts/external/inject.js"))).default);
const scraper = (await import(chrome.runtime.getURL("scripts/external/scraper.js"))).default;
const product = (await import(chrome.runtime.getURL("scripts/product.js"))).default;

export default class processor {
	#filter; 
	
	async scrape (fields) {
		this.data = new scraper ((fields) ? fields : this.targets); 
		console.log(this.data);
	}
	
	async analyze() {
		this.product = new product(this.data);
		await this.product.attach();
		await this.product.analyze();
		this.product.save();
		console.log(this.product.analysis);
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