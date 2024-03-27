/* windowman
Window management */

import texts from "./read.JS";

class windowman {
     /* Initialize the window frame. */
	static prepare() {
    try {
         let UI = {'library': [chrome.runtime.getURL('gui/styles/interface.external.css'), chrome.runtime.getURL('gui/styles/ui.css')], 'script': chrome.runtime.getURL('gui/scripts/external/interface.external.js')};

				 (UI.library).forEach((source) => {
					 	$(`head`).append(`<link rel="stylesheet" type="text/css" href="${source}">`);
				 })

         $(`head`).append(`<script type="module" src="${UI.script}"></script>`);
    } catch(error) {
         console.error(texts.localized(`error_fileNotFound`, [error]));
    }

		// Prevent scaling, similar to a real window.
		$(`head`).append(`<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />`);
	}


	constructor(URL, height, width) {
		this.window = chrome.windows.create({
	    url: chrome.runtime.getURL(URL),
	    type: "popup",
	    width: (width) ? width: 400,
	    height: (height) ? height: 600,
	  });
	}

	static fill() {

		function text() {
			let text_elements = document.querySelectorAll("[data-text]");

			text_elements.forEach((text_element) => {
				let text_inserted = texts.localized(text_element.getAttribute(`data-text`), (text_element.hasAttribute(`data-text-parameter`)) ? eval(text_element.getAttribute(`data-text-parameter`)) : null );
				if (!text_inserted) {text_inserted = texts.localized(`term_`.concat(text_element.getAttribute(`data-text`)));}

				text_element.innerText = text_inserted;
			})
		}

		function storage() {
			(async () => {
				// Import the module.
				const secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));

				let input_elements = document.querySelectorAll("[data-store]");

				input_elements.forEach((input_element) => {
					// Gather data about the element.
					// Get the corresponding storage data.
					let data = {};
					data[`source`] = input_element.getAttribute(`data-store`);
					data[`value`] = secretariat.read(data[`source`], -1);

					data[`value`].then((value) => {
						switch (input_element.getAttribute(`type`).toLowerCase()) {
							case `checkbox`:
								input_element.checked = value;
								break;
							case `progress`:
							case `range`:
								// Ensure that it is a positive floating-point number.
								value = (!value) ? 0 : Math.abs(parseFloat(value));
								if (value > 100) {value = value / 100};

								// Set the attribute of the progress bar.
								input_element.setAttribute(`value`, value);
								input_element.setAttribute(`max`, 1);
								break;
							default:
								input_element.value = value;
								break;
				    }
				  });

				});
			})();
		}

		text();
		storage();
	}

	/* Add click events. */
	static events() {

		/* Add events related to storage. */
		function storage() {
			(async () => {
				// Import the module.
				const secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));

				let input_elements = document.querySelectorAll("[data-store]");

				input_elements.forEach((input_element) => {
					// Gather data about the element.
					// Get the corresponding storage data.

					let element = {};
					element[`type`] = input_element.getAttribute(`type`).toLowerCase();
					element[`event`] = function() {};

					switch (element[`type`]) {
						case `checkbox`:
							element[`event`] = function() {
								let UI_item = {};
								UI_item[`source`] = this.getAttribute(`data-store`);
								UI_item[`value`] = this.checked;
								secretariat.write(UI_item[`source`], UI_item[`value`]);
							};
							break;
						case `range`:
							/*// Ensure that it is a positive floating-point number.
							value = (!value) ? 0 : Math.abs(parseFloat(value));
							if (value > 100) {value = value / 100};

							// Set the attribute of the progress bar.
							input_element.setAttribute(`value`, value);
							input_element.setAttribute(`max`, 1);*/
						default:
							element[`event`] = function() {
								secretariat.write(data[`source`][`root`], data[`source`][`target`], this.value);
							};
							break;
					}

					input_element.addEventListener('change', element[`event`]);
				});
			})();
		}

		/* Make it feel more like a native window. */
		function functionality() {
			/* Adjust the interface based on events. */
			function changeUI() {
				function tabs() {
					let menus = (document.querySelectorAll("menu[role=tablist]"))

					if (menus) {
						menus.forEach((menu) => {
							let buttons = menu.querySelectorAll("button, a");

							if (buttons) {
								buttons.forEach((button) => {
									let event = function() {
										// Prevent selection.
										let MENU = this.parentElement;
										let BUTTONS = MENU.querySelectorAll("button, a");

										BUTTONS.forEach((BUTTON) => {
											BUTTON.setAttribute(`aria-selected`, String(BUTTON.getAttribute(`for`) == this.getAttribute(`for`)));
										});

										let CONTAINER = document.getElementById(MENU.getAttribute(`for`));
										let SECTIONS = CONTAINER.querySelectorAll(`#${CONTAINER.id} > section`);

										SECTIONS.forEach((SECTION) => {
											// SECTION.setAttribute(`hidden`, true);

											if (!(this.getAttribute(`for`)).includes(SECTION.id)) {
												SECTION.setAttribute(`hidden`, ((this.getAttribute(`for`)).includes(SECTION.id)));
											} else {
												SECTION.removeAttribute(`hidden`);
											}
										});

										// Save.
										(async () => {
											const secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));

											// Write the data.
											secretariat.write([`view`, window.location.href], this.getAttribute(`for`), 1);
										})();
									};

									button.addEventListener('click', event);
								})
							}
						})
					}
				}

				tabs();
			};



			document.addEventListener('contextmenu', event => event.preventDefault());

			changeUI();
		}

		storage();
		functionality();
	}
}

export {windowman};
