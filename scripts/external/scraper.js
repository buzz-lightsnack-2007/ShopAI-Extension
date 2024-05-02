/* reader.js
Read the contents of the page.  
*/

export default class scraper {
	constructor(scraper_fields) {
		let field_content;

		// Quickly scroll down then to where the user already was to get automatically hidden content. 
		function autoscroll() {
			let SCROLL = {"x": window.scrollX, "y": window.scrollY};

			// Repeat two times to ensure proper webpage load. 
			for (let TIMES = 1; TIMES <= 2; TIMES++) {
				[{"top": 0, "left": 0, "behavior": "smooth"}, {"top": document.body.scrollHeight, "left": document.body.scrollWidth, "behavior": "smooth"}].forEach((POSITION) => {
					window.scrollTo(POSITION);
				})
			};

			// Scroll back to user's previous position.
			window.scrollTo({"top": SCROLL[`y`], "left": SCROLL[`x`], "behavior": "smooth"});
		};

		autoscroll();

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
	}
}