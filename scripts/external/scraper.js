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

		// Check every 1 second to check until autosccroll is done.
		function wait_autoscroll(OPTIONS) {
			return new Promise((resolve, reject) => {
				// Check if autoscroll is done.
				if (!((typeof window).includes(`undef`))) {
					autoscroll();
					resolve();
				} else if (OPTIONS[`wait until available`]) {
					setTimeout(() => {
						wait_autoscroll().then(resolve).catch(reject);
					}, 1000);
				} else {
					reject();
				}
			});
		}
		wait_autoscroll(options).then(() => {read();});
	}
}