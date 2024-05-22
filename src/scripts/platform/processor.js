/* processor.js 
Process the information on the website and display it on screen. 
*/

import scraper from "/scripts/platform/scraper.js";
import product from "/scripts/data/product.js";
import {global, background} from "/scripts/secretariat.js";
import logging from "/scripts/logging.js";
import texts from "/scripts/mapping/read.js";
import {URLs} from "/scripts/utils/URLs.js";
import gemini from "/scripts/AI/gemini.js";

export default class processor {
	#filter; 
	#analyzer;
	
	async scrape (fields, options) {
		this.product.details = new scraper (((fields) ? fields : this.targets), options); 

		// Read product data and gather the SHA512 hash. 
		await this.product.read();
		
		// Save the details already. 
		return(await this.product.save());
	}
	
	async analyze(options = {}) {
		const main = async() => {
			// Set up the analyzer.
			this.#analyzer = (this.#analyzer) ? this.#analyzer : new gemini (await global.read([`settings`,`analysis`,`api`,`key`]), `gemini-1.5-pro-latest`);
	
			// Set up current data of the site, but forget about its previous errored state. 
			delete this.status[`error`];
	
			// Set the completion state to anything else but not 1. 
			(this.status[`done`] >= 1) ? this.#notify(0) : false;

			const perform = async() => {
				if (((this.product.analysis && !((typeof this.product.analysis).includes(`undef`)))
					? !((typeof this.product.analysis).includes(`obj`) && !Array.isArray(this.product.analysis))
					: true)
				|| this.product.status[`update`] || ((options && (typeof options).includes(`obj`)) ? options[`override`] : false)) {
					// Add the prompt.
					let PROMPT = [];
					PROMPT.push({"text": ((new texts(`AI_message_prompt`)).localized).concat(JSON.stringify(this.product.details.texts))});
					
					// Run the analysis.
					await this.#analyzer.generate(PROMPT);
	
					// Raise an error if the product analysis is blocked. 
					this.status[`blocked`] = this.#analyzer.blocked;
					if (this.status[`blocked`]) {
						this.status.error = {"name": (new texts(`blocked`)).localized, "message": (new texts(`error_msg_blocked`)).localized, "stack": analyzer.response};
						throw Error();
					};
	
					if (this.#analyzer.candidate) {
						// Remove all markdown formatting.
						this.product.analysis = JSON.parse(this.#analyzer.candidate.replace(/(```json|```|`)/g, ''));
						
						// Save the data. 
						await this.product.save();
					};
				}
			}
	
			// Try analysis of the data.
			try {
				await perform();
				
				// Indicate that the process is done. 
				this.#notify(1);
				// Display the results. 
				new logging(texts.localized(`AI_message_title_done`), JSON.stringify(this.product.analysis));

				// Save the data. 
				this.product.save();
			} catch(err) {
				// Use the existing error, if any exists. 
				if (!this.status.error) {
					this.status.error = {};
					[`name`, `message`, `stack`].forEach((KEY) => {
						this.status.error[KEY] = err[KEY];
					});
				}
				
				// Display the error.
				this.#notify(-1);
			};
		};

		const wait = async () => {
			let RUN = false;
			if (await global.read([`settings`,`analysis`,`api`,`key`])) {
				await main();
				RUN = true;
			} else {
				new logging(texts.localized(`AIkey_message_waiting_title`), texts.localized(`AIkey_message_waiting_body`));
				new background(async () => {
					if ((!RUN) ? (await global.read([`settings`,`analysis`,`api`,`key`])) : false) {
						await main();
						RUN = true;
					}
				});
			}
		}

		wait();
	};

	/*
	Run in the chronological order. Useful when needed to be redone manually. 
	*/
	async run (options = {}) {
		this.#notify((this.targets) ? .25 : 0);

		// Scrape the data. 
		await this.scrape(null, ((typeof options).includes(`obj`) && options) ? options[`scrape`] : null);
		
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
		if ((await global.write([`sites`, this.URL, `status`], this.status, -1)) && (this.status[`done`] >= 0)) {
			// Set the status to its whole number counterpart. 
			let STATUS = Math.round(status * 100);
			
			// Get the corresponding status message. 
			new logging(texts.localized(`scrape_msg_`.concat(String(STATUS))), (String(STATUS)).concat("%"));
			return true;
		} else if (this.status[`done`] < 0) {
			logging.error(this.status.error);	
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