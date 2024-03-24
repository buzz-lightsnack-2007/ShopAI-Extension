/* windowman
Window management */

let UI = {'library': chrome.runtime.getURL('gui/styles/interface.external.css')};

export default class windowman {
	/* Initialize the window frame. */
	static prepare() {
		$(`head`).append(`<link rel="stylesheet" type="text/css" href="${UI.library}">`);
	}

	/*
	Updates an interface element.

	@param {string} interface_element the element to change
	@param {string} modified_content the replacement of its content
	@param {int} method Do you want to replace or just add? Type 0 or 1, respectively.
	@return {string} the HTML content
	*/
	update(interface_element, modified_content, method = 0) {
		if (method > 0) {
			$(`#${interface_element['ID']}`).append(modified_content);
		} else if (method < 0) {
			$(`#${interface_element['ID']}`).prepend(modified_content);
		} else {
			$(`#${interface_element['ID']}`).html(modified_content);
		}
		
		return ($(`#${interface_element['ID']}`).html());
	};

	/*
	Inserts an interface element.

	@param {string} element_ID the ID of the element to be injected
	@param {string} element_name the colloquial name of this element
	@param {string} parent_element_name the parent element's colloquial name
	@param {string} element_type the type of this element to insert
	@param {string} element_content the content of this new element
	@param {array} element_class the class of this element
	@param {dictionary} element_properties the element's properties
	@return {string} the element ID
	*/
	inject(element_ID, element_name, parent_element_name, element_type = `div`, element_class = [], element_content = ``, element_properties = {}) {
		// If no element ID is provided, create a random ID as well. 
		if (!element_ID) {
			element_ID = (Math.floor((Math.random())**(-3))).toString();
		};
		
		// Prepare for injection. 
		let element_injection = {};
		
		element_injection[`ID`] = (((parent_element_name) ? this[parent_element_name][`ID`] : this[`ID`]).concat(`_`)).concat(element_ID);
		element_injection[`type`] = element_type;
		if (element_properties) {element_injection[`properties`] = element_properties};
		if (element_class) {element_injection[`class`] = element_properties;}
		
		// Add it to this window's properties. 
		if (parent_element_name) {
			this[parent_element_name][element_name] = element_injection;
		} else {
			this[element_name] = element_injection;
		}
		
		// Inject the element. 
		$(`#`.concat(((parent_element_name) ? this[parent_element_name] : this)[ID]) ).append(`<${element_inject['type']} id=${element_inject['ID']}> </${element_inject['type']}>`)
		
		// Now add the classes. 
		if (element_injection[`class`]) {
			(element_injection[`class`]).forEach((class_name) => {
				$(`#`.concat(((parent_element_name) ? this[parent_element_name][element_name] : this[element_name])[ID])).addClass(class_name);
			});
		};
		
		if (element_injection[`properties`]) {
			(Object.keys(element_injection[`properties`])).forEach((property_name) => {
				$(`#`.concat(((parent_element_name) ? this[parent_element_name][element_name] : this[element_name])[ID]).attr(property_name, element_injection[`properties`][property_name]));
			});
		}
		
		// Add the content. 
		update(((parent_element_name) ? this[parent_element_name][element_name] : this[element_name]), element_content); 
		
		// Return the content. 
		return(element_injection[`ID`]);
	};
	
	
	/* The following are reserved keywords in colloquial names: 
		ID, properties, type
	*/

	/*
	Creates a window frame within the specified element.

	@param {string} element_target the element name to build into
	@param {string} element_ID the target element ID; otherwise, a random ID is generated
	@param {string} window_title the window's title
	@param {dictionary} window_buttons the window buttons
	*/
	constructor(element_target, element_ID, window_title = document.title, window_buttons = {'Close': false, 'Minimize': false, 'Maximize': false}) {
		if (!element_ID) {
			// Make a random element ID.
			element_ID = (Math.floor((Math.random())**(-3))).toString();
		};

		let element_data = {
			'ID': element_ID,
			'titlebar': {
				'ID': `${element_ID}_titlebar`,
				'title': {
					'ID': `${element_ID}_title`
				},
				'controls': {
					'ID': `${element_ID}_btns`,
					'Close': {
						'ID': `${element_ID}_btn_close`,
						'visible': false
					}, 
					'Minimize': {
						'ID': `${element_ID}_btn_min`,
						'visible': false
					},
					'Maximize': {
						'ID': `${element_ID}_btn_max`,
						'visible': false
					}
				}
			},
			'content': {
				'ID': `${element_ID}_content`
			}
		}

		function frame() {
			$(element_target).append(`<section id="${element_data.ID}"></section>`);
			$(`#${element_data.ID}`).addClass(`window active`);
		}

		function titlebar() {
			$(`#${element_data.ID}`).append(`<top id="${element_data.titlebar.ID}"></top>`);
			$(`#${element_data.titlebar.ID}`).addClass(`title-bar`);

			function title() {
				$(`#${element_data.titlebar.ID}`).append(`<span id="${element_data.titlebar.title.ID}"></span>`);
				$(`#${element_data.titlebar.title.ID}`).addClass(`title-bar-text`);

				if (window_title) {
					$(`#${element_data.titlebar.title.ID}`).text(window_title);
				};
			};

			function controls() {
				if (window_buttons) {
					$(`#${element_data.titlebar.ID}`).append(`<side id="${element_data.titlebar.controls.ID}"></side>`);
					$(`#${element_data.titlebar.controls.ID}`).addClass(`title-bar-controls`);

					// Get the close
					(Object.keys(window_buttons)).forEach((btn_label) => {
						if (window_buttons[btn_label]) {
							$(`#${element_data.titlebar.controls.ID}`).append(`<button id="${element_data.titlebar.controls[btn_label].ID}"></button>`);
							$(`#${element_data.titlebar.controls[btn_label].ID}`).attr(`aria-label`, btn_label);
						};
					})
				};
			};

			title();
			controls();
		}

		function content() {
			$(`#${element_data.ID}`).append(`<main id="${element_data.content.ID}"></main>`);
			$(`#${element_data.content.ID}`).addClass(`window-body has-space`);
		}

		// Add to this window's properties. 
		(Object.keys(element_data)).forEach((portion) => {
			this[portion] = element_data[portion];
		})

		frame();
		titlebar();
		content();
	}

}
