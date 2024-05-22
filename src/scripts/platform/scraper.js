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
			function wait(OPTIONS) {
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
			}

			wait(this.#options).then(() => {
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
			});
		}
	}

	/*
	Scrape the texts of the page.

	@param {Object} fields the fields to scrape
	@param {Object} options the options
	@return {Object} the texts
	*/
	getTexts(fields, options) {
		let CONTENT;

		/* Read for the particular fields. */
		function read(fields) {
			let DATA = {}; // Store here the resulting data
			
			(Object.keys(fields)).forEach((NAME) => {
				// Remove trailing spaces within the name. 
				NAME = (typeof NAME).includes(`str`) ? NAME.trim() : NAME;
				
				// Set the referring value.
				let VALUE = fields[NAME];
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
						(document.querySelector(VALUE))
							? DATA[NAME] = document.querySelector(VALUE).textContent.trim()
							: false;
					};
				};
			});

			return DATA;
		};

		// Determine and set the appropriate field source. 
		let FIELDS = (((typeof fields).includes(`obj`) && fields) ? Object.keys(fields).length : false) ? fields : this.fields;
		((((typeof options).includes(`obj`) && options) ? Object.hasOwn(`update`) : false) ? options[`update`] : true)
			? this.fields = FIELDS
			: null;

		// Read the fields. 
		(FIELDS)
			? CONTENT = read(FIELDS)
			: false;

		// Set the data if the options doesn't indicate otherwise. 
		(((((typeof options).includes(`obj`) && options) ? Object.hasOwn(`update`) : false) ? options[`update`] : true) && CONTENT)
			? this.texts = CONTENT
			: false;
		return (CONTENT);
	};

	/*
	Scrape the images from a page. 

	@param {Object} fields the fields to scrape
	@param {Object} options the options
	@return {Object} the blob of the images
	*/
	async getImages(fields, options) {
		let CONTENT; 

		/*
		Get the blob of the image in an element. 

		@param {Element} element the element to get the blob from
		@return {Blob} the blob of the image
		*/
		async function blobbify(element) {
			/*
			Get the URL of the image. 

			@param {Element} element the element to get the URL from
			@return {String} the URL of the image
			*/
			function reference(element) {
				let LOCATION;

				// Get using standard attributes. 
				LOCATION = element.getAttribute(`src`);

				if (!LOCATION) {
					// Use the CSS background image.
					(window.getComputedStyle(element).backgroundImage)
						? LOCATION = window.getComputedStyle(element).backgroundImage.slice(4, -1).replace(/"/g, "")
						: false;
				}

				// Return the location. 
				return LOCATION;
			}

			/*
			Get the blob from the URL. 

			@param {String} URL the URL to get the blob from
			@return {Blob} the blob of the image
			*/
			function getBlob(URL) {
				return(net.download(URL, `blob`));
			}

			let LOCATION = reference(element);
			let BLOB = await getBlob(LOCATION);

			return ((BLOB.type.includes(`image`)) ? BLOB : null);
		}

		/* Read for the particular fields. */
		async function read(fields) {
			/*
			Select all images from an element and get their blobs. 

			@param {Element} element the element to get the images from
			@return {Array} the blobs of the images
			*/
			async function select(element) {
				let IMAGES = [...element.querySelectorAll(`*`)];
				let BLOBS = [];

				if (IMAGES && IMAGES.length) {
					for (let IMAGE of IMAGES) {
						let BLOB = await blobbify(IMAGE);
						(BLOB) ? BLOBS.push(BLOB) : false;
					}
				}

				return BLOBS;
			}

			let DATA = []; // Store here the resulting data

			for (let NAME of Object.keys(fields)) {
				// Remove trailing spaces within the name. 
				NAME = (typeof NAME).includes(`str`) ? NAME.trim() : NAME;
				let VALUE = fields[NAME];

				if (VALUE && NAME) {
					// Check if array.
					if (Array.isArray(VALUE)) {
						// Temporarily create an empty list. 
						for (let PARTICULAR of VALUE) {
							if ((typeof PARTICULAR).includes(`obj`) && PARTICULAR && !Array.isArray(PARTICULAR)) {
								DATA = [...DATA, ...(await read(PARTICULAR))];
							} else {
								let ELEMENTS = [...(document.querySelectorAll(PARTICULAR))];

								if (ELEMENTS && ELEMENTS.length) {
									for (let ELEMENT of ELEMENTS) {
										let BLOBS = await select(ELEMENT);
										if (BLOBS && BLOBS.length) DATA = [...DATA, ...BLOBS];
									}
								}
							}
						}
					} else if ((typeof VALUE).includes(`obj`) && VALUE) {
						DATA = [...DATA, ...(await read(VALUE))];
					} else if (document.querySelector(VALUE)) {
						let ELEMENTS = [...(document.querySelectorAll(VALUE))];

						if (ELEMENTS && ELEMENTS.length) {
							for (let ELEMENT of ELEMENTS) {
								let BLOBS = await select(ELEMENT);
								if (BLOBS && BLOBS.length) DATA = [...DATA, ...BLOBS];
							}
						}
					}
				}
			}

			return (DATA);
		};

		// Read the fields. 
		(((typeof fields).includes(`obj`) && fields) ? Object.keys(fields).length : false)
			? CONTENT = await read(fields)
			: false;

		// Set the data if the options doesn't indicate otherwise. 
		(((((typeof options).includes(`obj`) && options) ? Object.hasOwn(`update`) : false) ? options[`update`] : true) && CONTENT)
			? this.images = CONTENT
			: false;
		return (CONTENT);
	}
}