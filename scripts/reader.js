/* reader.js
Read the contents of the page.  
*/

export default class reader {
	constructor(scraper_fields) {
		let field_content;

		if (Array.isArray(scraper_fields)) {
			// Convert scraper_fields to a dictionary.
			let scraper_fields_all = {};

			for (let field_index = 0; field_index < scraper_fields.length; field_index++) {
				scraper_fields_all[field_index] = scraper_fields[field_index];
			}

			scraper_fields = scraper_fields_all;
		};
		if (typeof scraper_fields === "object" && scraper_fields != null && scraper_fields) {

			/* Read for the particular fields. */
			function read(fields) {
				let field_names = Object.keys(fields), field_data = {};

				for (let field_index = 0; field_index < fields.length; field_index++) {
					let field_current = fields[field_names[field_index]];

					if (field_current) {
						// Check if array.
						if (Array.isArray(field_current)) {
							field_data[field_names[field_index]] = [];

							
							if (typeof field_current[0] === "object" && field_current[0] != null && field_current[0]) {
								field_data[field_names[field_index]].push(read(field_current[0]));
							} else {
								let matching_elements = (document.querySelectorAll(field_current[0]));

								for (let field_current_index = 0; field_current_index < matching_elements.length; field_current_index++) {
									field_data[field_names[field_index]].push(matching_elements[field_current_index].innerText);
								};
							};
						} else if (typeof field_current === "object" && field_current != null && field_current) {
							field_data[field_names[field_index]] = read(field_current);
						} else {
							field_data[field_names[field_index]] = (document.querySelector(field_current)) ? document.querySelector(field_current).innerText : null;
						};
					};
				};

				return field_data;
			};

			field_content = read(scraper_fields);
		}

		if (Object.keys(field_content).length > 0) {
			for (let field_name in Object.keys(field_content)) {
				this[field_name] = field_content[field_name];
			}
		}
	}
}