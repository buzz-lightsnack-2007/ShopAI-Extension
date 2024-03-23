/* windowman
Window management */

let UI = {'library': chrome.runtime.getURL('gui/styles/interface.external.css')};

export default class windowman {
	/* Initialize the window frame. */
	static prepare() {
		$(`head`).append(`<link rel="stylesheet" type="text/css" href="${UI.library}">`);
	}

	/*
	Creates a window frame within the specified element.

	@param {string} element_target the element name to build into
	@param {string} element_ID the target element ID; otherwise, a random ID is generated
	@param {string} window_title the window's title
	@param {dictionary} window_buttons the window buttons
	@return {string} the element IDs
	*/
	constructor(element_target, element_ID, window_title = document.title, window_buttons = {'Close': false, 'Minimize': false, 'Maximize': false}) {
		if (!element_ID) {
			// Make a random element ID.
			element_ID = (Math.floor((Math.random())**(-3))).toString();
		};

		let element_data = {
			'ID': element_ID,
			'titlebar': `${element_ID}_titlebar`,
			'title': `${element_ID}_title`,
			'controls': `${element_ID}_btns`,
			'controls Close': `${element_ID}_btn_close`,
			'controls Minimize': `${element_ID}_btn_min`,
			'controls Maximize': `${element_ID}_btn_max`,
			'content': `${element_ID}_content`
		}

		function frame() {
			$(element_target).append(`<section id="${element_data.ID}"></section>`);
			$(`#${element_data.ID}`).addClass(`window active`);
		}

		function titlebar() {
			$(`#${element_data.ID}`).append(`<top id="${element_data.titlebar}"></top>`);
			$(`#${element_data.titlebar}`).addClass(`title-bar`);

			function title() {
				$(`#${element_data.titlebar}`).append(`<span id="${element_data.title}"></span>`);
				$(`#${element_data.title}`).addClass(`title-bar-text`);

				if (window_title) {
					$(`#${element_data.title}`).text(window_title);
				};
			};

			function controls() {
				if (window_buttons) {
					$(`#${element_data.titlebar}`).append(`<side id="${element_data[`controls`]}"></side>`);
					$(`#${element_data.controls}`).addClass(`title-bar-controls`);

					// Get the close
					(Object.keys(window_buttons)).forEach((btn_label) => {
						if (window_buttons[btn_label]) {
							$(`#${element_data.controls}`).append(`<button id="${element_data[`controls ${btn_label}`]}"></button>`);
							$(`#${element_data[`controls ${btn_label}`]}`).attr(`aria-label`, btn_label);
						};
					})
				};
			};

			title();
			controls();
		}

		function content() {
			$(`#${element_data.ID}`).append(`<main id="${element_data.content}"></main>`);
			$(`#${element_data.content}`).addClass(`window-body has-space`);
		}

		(Object.keys(element_data)).forEach((portion) => {
			this[portion] = element_data[portion];
		})

		frame();
		titlebar();
		content();
	}

	/*
	Updates an interface element.

	@param {string} interface_element the element to change
	@param {string} modified_content the replacement of its content
	@param {int} method Do you want to replace or just add? Type 0 or 1, respectively.
	*/
	update(interface_element, modified_content, method) {
		if (method > 0) {
			$(`#${this[interface_element]}`).append(modified_content);
		} else if (method < 0) {
			$(`#${this[interface_element]}`).prepend(modified_content);
		} else {
			$(`#${this[interface_element]}`).html(modified_content);
		}
	};

	inject(element_ID, parent_element = this.ID) {

	};

}
