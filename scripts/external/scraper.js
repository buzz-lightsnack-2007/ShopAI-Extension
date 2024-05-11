/* reader.js
Read the contents of the page.  
*/

export default class scraper {
	/*
	Scrape fields. 

	@param {Object} scraper_fields the fields to scrape
	@param {Object} options the options
	*/
	constructor(scraper_fields, options = {"wait until available": true}) {
		let field_content;

		// Quickly scroll down then to where the user already was to get automatically hidden content. 
		function autoscroll() {
			let SCROLL = {"x": parseInt(window.scrollX), "y": parseInt(window.scrollY)};

			// Repeat every ten milliseconds until 3 times.

			for (let SCROLLS = 1; SCROLLS <= 2; SCROLLS++) {
				[{"top": document.body.scrollHeight, "left": document.body.scrollWidth}, {"top": 0, "left": 0}].forEach(POSITION => {
					setTimeout(() => {
						window.scrollTo(POSITION);
					}, 10);
				});
			}

			// Scroll back to user's previous position.
			setTimeout(() => {
				window.scrollTo(SCROLL);
			}, 5)
		};

		const read = () => {
			if ((typeof scraper_fields).includes("object") && scraper_fields != null && scraper_fields) {
	
				/* Read for the particular fields. */
				function read(fields) {
					let field_data = {};
	
					(Object.keys(fields)).forEach((FIELD_NAME) => {
						let FIELD = {"name": FIELD_NAME, "value": fields[FIELD_NAME]};
	
						if (FIELD[`value`]) {
							// Check if array.
							if (Array.isArray(FIELD[`value`])) {
								// Temporarily create an empty list. 
								field_data[FIELD[`name`]] = [];
								
								if (typeof FIELD[`value`][0] == "object" && FIELD[`value`][0] != null && !Array.isArray(FIELD[`value`][0])) {
									field_data[FIELD[`name`]].push(read(FIELD[`value`][0]));
								} else {
									let ELEMENTS = (document.querySelectorAll(FIELD[`value`][0]));
									
									if (ELEMENTS.length > 0) {
										(ELEMENTS).forEach((ELEMENT) => {
											field_data[FIELD[`name`]].push(ELEMENT.innerText);
										})
									};
								};
							} else if ((typeof FIELD[`value`]).includes(`obj`) && FIELD[`value`] != null) {
								field_data[FIELD[`name`]] = read(FIELD[`value`]);
							} else if (document.querySelector(FIELD[`value`])) {
								field_data[FIELD[`name`]] = document.querySelector(FIELD[`value`]).innerText;
							};
						};
					});
	
					return field_data;
				};
				field_content = read(scraper_fields);
			}
	
			if (Object.keys(field_content).length > 0) {
				(Object.keys(field_content)).forEach((field_name) => {
					this[field_name] = field_content[field_name];
				});
			}
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