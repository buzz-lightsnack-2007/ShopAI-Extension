/* reader.js
Read the contents of the page.
*/

import net from "/scripts/utils/net.js";

export default class scraper {
	#options;

	/*
	Scrape fields.

	@param {Object} scraper_fields the fields to scrape
	@param {Object} options the options
	*/
	constructor(fields, options) {
		(((typeof fields).includes(`obj`) && fields) ? Object.keys(fields).length : false)
			? this.fields = fields
			: false;
		this.#options = Object.assign({}, {"scroll": true, "duration": 125, "automatic": true, "background": true}, options);

		if (this.#options.automatic) {
			// Quickly scroll down then to where the user already was to get automatically hidden content.
			async function autoscroll(options) {
				let SCROLL = {"x": parseInt(window.scrollX), "y": parseInt(window.scrollY)};
				let DURATION = Math.abs(options[`duration`]);

				// Repeat every ten milliseconds until 3 times.
				function go(position, duration) {
					Object.assign({}, position, {"behavior": `smooth`})

					return new Promise(resolve => {
						window.scrollTo(position);
						setTimeout(resolve, duration);
					});
				}

				// Scroll two times to check for updated data.
				for (let SCROLLS = 1; SCROLLS <= 2; SCROLLS++) {
					for (const POSITION of [{"top": document.body.scrollHeight, "left": document.body.scrollWidth}, {"top": 0, "left": 0}]) {
						await go(POSITION, DURATION);
					}
				};

				// Scroll back to user's previous position.
				setTimeout(() => {window.scrollTo(SCROLL);}, DURATION)
			};

			// Check every 1 second to check until autosccroll is done.
			/*function wait(OPTIONS) {
				return new Promise((resolve, reject) => {
					// Check if autoscroll is done.
					if (!((typeof window).includes(`undef`))) {
						autoscroll(OPTIONS);
						resolve();
					} else if (OPTIONS[`scroll`]) {
						setTimeout(() => {
							wait(OPTIONS).then(resolve).catch(reject);
						}, 1000);
					} else {
						reject();
					}
				});
			}*/

			this.getTexts(this.fields, this.#options);
			this.getImages(this.fields, this.#options);

			if (this.#options.background) {
				// Event listener when elements are added or removed.
				const OBSERVER = new MutationObserver((mutations) => {
					this.getTexts(this.fields, this.#options);
					this.getImages(this.fields, this.#options);
				});

				// Observe the document.
				OBSERVER.observe(document.body, {"childList": true, "subtree": true});
			}
		}
	}

	/*
	Scrape the texts of the page.

	@param {Object} fields the fields to scrape
	@param {Object} options the options
	@return {Object} the texts
	*/
	getTexts(FIELDS, OPTIONS) {
		let CONTENT;

		/* Read for the particular fields. */
		function read(FIELDS) {
			let DATA = {}; // Store here the resulting data

			(Object.keys(FIELDS)).forEach((NAME) => {
				// Remove trailing spaces within the name.
				NAME = (typeof NAME).includes(`str`) ? NAME.trim() : NAME;

				// Set the referring value.
				let VALUE = FIELDS[NAME];
				VALUE = (typeof VALUE).includes(`str`) ? VALUE.trim() : VALUE;

				if (VALUE && NAME) {
					// Check if array.
					if ((Array.isArray(VALUE)) ? VALUE.length : false) {
						// Temporarily create an empty list.
						DATA[NAME] = [];

						VALUE.forEach((PARTICULAR) => {
							if ((typeof PARTICULAR).includes("obj") && PARTICULAR && !Array.isArray(PARTICULAR)) {
								DATA[NAME].push(read(PARTICULAR));
							} else {
								let ELEMENTS = [...(document.querySelectorAll(PARTICULAR))];

								(ELEMENTS && ELEMENTS.length)
									? (ELEMENTS).forEach((ELEMENT) => {
										DATA[NAME].push(ELEMENT.textContent.trim());
									})
									: false;
							};
						})
					} else if ((typeof VALUE).includes(`obj`) && VALUE && !Array.isArray(VALUE)) {
						DATA[NAME] = read(VALUE);
					} else if (document.querySelector(VALUE)) {
						DATA[NAME] = document.querySelector(VALUE).textContent.trim()
					};
				};
			});

			return DATA;
		};

		// Determine and set the appropriate field source.
		let CRITERIA = (((typeof FIELDS).includes(`obj`) && FIELDS) ? Object.keys(FIELDS).length : false) ? FIELDS : this.fields;
		((((typeof OPTIONS).includes(`obj`) && OPTIONS) ? Object.hasOwn(`update`) : false) ? OPTIONS[`update`] : true)
			? this.fields = CRITERIA
			: null;

		// Read the fields.
		(CRITERIA)
			? CONTENT = read(CRITERIA)
			: false;

		// Set the data if the options doesn't indicate otherwise.
		(((((typeof OPTIONS).includes(`obj`) && OPTIONS) ? Object.hasOwn(`update`) : false) ? OPTIONS[`update`] : true) && CONTENT)
			? this.texts = CONTENT
			: false;
		return (CONTENT);
	};
}
