/* windowman
Window and window content management */

import texts from "../../mapping/read.js";
import net from "/scripts/utils/net.js";
import Window from "../window.js";
import {global} from "/scripts/secretariat.js";

export default class windowman {
	static new(URL, height, width) {
		this.window = chrome.windows.create({url: (URL.includes(`://`)) ? URL :  chrome.runtime.getURL(URL), type: "popup", width: width ? parseInt(width) : 600, height: height ? parseInt(height) : 600});
	}

	// Prepare the window with its metadata.
	constructor(OPTIONS) {
		function headers(OPTIONS) {
			let LOAD_STATE = true;
			let UI = {
				CSS: ["/styles/external/fonts/materialdesignicons.min.css", "/styles/external/materialize/css/materialize.css", "/styles/ui.css"]
			};

			// Add additional sources. 
			(OPTIONS) ? ((OPTIONS[`CSS`] != null) ? ((Array.isArray(OPTIONS[`CSS`])) ? UI[`CSS`] = UI[`CSS`].concat(OPTIONS[`CSS`]) : UI[`CSS`].push(OPTIONS[`CSS`])) : null) : null;

			(UI[`CSS`]).forEach(async (source) => {
				try {
					let resource = false;
					
					try {
						resource = await net.download(source, `text`, true);
					} catch (err) {}

					if (resource) {
						let metadata_element = document.createElement(`link`);
						metadata_element.setAttribute(`rel`, `stylesheet`);
						metadata_element.setAttribute(`type`, `text/css`);
						metadata_element.setAttribute(`href`, source);
						document.querySelector(`head`).appendChild(metadata_element);
					} else {
						throw new ReferenceError((new texts(`error_msg_fileNotFound`, [source])).localized);
					}
				} catch(err) {
					const secretariat = (await import(chrome.runtime.getURL(`/scripts/secretariat.js`)));
					const logging = (await import(chrome.runtime.getURL(`/scripts/logging.js`))).default;
					
					// Raise an alert. 
					logging.error(err.name, err.message, err.stack, true, [source]);

					// Stop loading the page when an error has occured; it's not going to work!
					if ((await secretariat.global.read(`debug`, -1) != null) ? await secretariat.global.read(`debug`, -1) : true) {
						window.close();
					};
				};
			})
		}

		// Get the window.
		this[`metadata`] = chrome.windows.getCurrent();

		/* Fill in data and events.  */
		function appearance() {
			// Add missing classes to all elements.
			function elements() {
				// Add buttons elements.
				function buttons() {
					document.querySelectorAll(`button`).forEach((button) => {
						if (!button.classList.contains(`btn`)) {
							button.classList.add(`btn`);
						}
					});

					[]
						.concat(document.querySelectorAll(`a`), document.querySelectorAll(`button`), document.querySelectorAll(`textarea`), document.querySelectorAll(`input:not([type="checkbox"]):not([type="radio"]):not([type="range"])`))
						.forEach((ELEMENT_TYPE) => {
							ELEMENT_TYPE.forEach((button) => {
								if (
									button.classList
										? !button.classList.contains(`waves-effect`)
										: true
								) {
									button.classList.add(`waves-effect`);
								}
							});
						});
				}
				buttons();
			}

			function icons() {
				let target_elements = document.querySelectorAll(`[data-icon]`);

				target_elements.forEach((element) => {
					// Get the content before removing it.
					let element_data = {};

					// Swap the placement of the existing content.
					function swap() {
						element_data[`content`] = element.innerHTML;
						element.innerHTML = ``;

						let element_text = document.createElement(`span`);
						element_text.innerHTML = element_data[`content`];

						element.appendChild(element_text);
					}

					// Add the icon.
					function iconify() {
						// Get the icon.
						element_data[`icon`] = element.getAttribute(`data-icon`);

						// Get the icon.
						let icon_element = document.createElement(`i`);
						icon_element.className = `mdi mdi-`.concat(element_data[`icon`]);
						element.prepend(icon_element);
					}

					function clean() {
						element.removeAttribute(`data-icon`);
					};

					swap();
					iconify();
					clean();
				});
			}

			function text() {
				let text_elements = {};
				text_elements[`content`] = document.querySelectorAll("[for]");
				text_elements[`alt`] = document.querySelectorAll("[alt-for]");
				text_elements[`title`] = document.querySelectorAll("[title-for]");

				text_elements[`content`].forEach((text_element) => {
					let text_inserted = texts.localized(
						text_element.getAttribute(`for`),
						false,
						text_element.hasAttribute(`for-parameter`)
							? text_element.getAttribute(`for-parameter`).split(",")
							: null,
					);
					if (!text_inserted) {
						text_inserted = texts.localized(
							`term_`.concat(text_element.getAttribute(`for`)),
						);
					}

					if (text_element.tagName.toLowerCase().includes(`input`)) {
						text_element.setAttribute(`placholder`, text_inserted);
					} else {
						text_element.innerText = text_inserted;
					}
				});

				delete text_elements[`content`];
				Object.keys(text_elements).forEach((key) => {
					if (text_elements[key]) {
						text_elements[key].forEach((text_element) => {
							let text_inserted = texts.localized(
								text_element.getAttribute(key.concat(`-for`)),
								false,
								text_element.hasAttribute(key.concat(`for-parameter`))
									? text_element
											.getAttribute(key.concat(`for-parameter`))
											.split(",")
									: null,
							);
							if (!text_inserted) {
								text_inserted = texts.localized(
									`term_`.concat(text_element.getAttribute(key.concat(`-for`))),
								);
							}

							text_element.setAttribute(key, text_inserted);
							text_element.removeAttribute(key.concat(`-for`));
						});
					}
				});
			}

			elements();
			text();
			icons();
		}

		// Adds events to the window.
		function events() {
			/* Map buttons to their corresponding action buttons. */
			function actions() {
				function links() {
					let buttons = document.querySelectorAll("button[href]");

					if (buttons) {
						buttons.forEach((button) => {
							// Get the data from the button.
							let target = {};
							target[`source`] = button.getAttribute(`href`);
							target[`dimensions`] = {};
							target[`dimensions`][`height`] = (button.getAttribute(`tab-height`)) ? parseInt(button.getAttribute(`tab-height`))
							: null;
							target[`dimensions`][`width`] = (button.getAttribute(`tab-width`)) ? parseInt(button.getAttribute(`tab-width`))
							: null;
							
							const event = function () {
								// Get the correct path.
								target[`path`] = (
									!target[`source`].includes(`://`)
										? window.location.pathname.split(`/`).slice(0, -1).join(`/`).concat(`/`)
										: ``
								).concat(target[`source`]);

								// Open the window as a popup. 
								new Window(target[`path`], Object.assign(target[`dimensions`], {"type": "popup"}));
							};

							button.addEventListener("click", event);
							button.removeAttribute(`href`);
						});
					}
				}

				// Responsiveness to different screen sizes.
				function resize() {
					function sidebar() {
						
						if (document.querySelector(`.sidenav`)) {
							(document.querySelectorAll(`.sidenav`)).forEach(function (sidebar_element) {
								if (sidebar_element.getAttribute(`name`)) {
									document.querySelector(`[works-sidebar="${sidebar_element.getAttribute(`name`)}"]`)
									.addEventListener(`click`, () => {
										M.Sidenav.getInstance(sidebar_element).open();
									});
								} else if (document.querySelector(`[data-action="ui,open,navbar"]`)) {
									document.querySelector(`[data-action="ui,open,navbar"]`).forEach(function (button_element) {
										button_element.addEventListener(`click`, () => {
											M.Sidenav.getInstance(sidebar).open();
										});
									});
								}
							});
						}
					}

					sidebar();
				}

				resize();
				links();
			}
			
			actions();
		}
		
		headers(((OPTIONS != null && typeof OPTIONS == `object`) ? OPTIONS[`headers`] : false)? OPTIONS[`headers`] : null);
		appearance();
		events();
	}

	/* Run this function if you would like to synchronize with data. */
	async sync() {
		// Import the module.
		const secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));
		const logging = (await import(chrome.runtime.getURL(`/scripts/logging.js`))).default;
		
		async function fill() {
			let input_elements = document.querySelectorAll("[data-store]");

			input_elements.forEach(function(input_element) {
				// Gather data about the element.
				// Get the corresponding storage data.
				let data = {};
				data[`source`] = input_element.getAttribute(`data-store`);
				// data[`origin`] = (input_element.hasAttribute(`data-store-location`)) ? parseInt(input_element.getAttribute(`data-store-location`)) : -1
				data[`value`] = secretariat.global.read(data[`source`]);

				data[`value`].then(async function(value) {
					switch (input_element.getAttribute(`type`).toLowerCase()) {
						case `checkbox`:
							input_element.checked = value;
							break;
						case `progress`:
						case `range`:
							// Ensure that it is a positive floating-point number.
							value = !value ? 0 : Math.abs(parseFloat(value));
							if (value > 100) {
								value = value / 100;
							}

							// Set the attribute of the progress bar.
							input_element.setAttribute(`value`, value);
							input_element.setAttribute(`max`, 1);
							break;
						default:
							input_element.value = value ? value : ``;
							break;
					};
				});
			});
		}
		
		/* Add events related to storage. */
		async function update() {
			let input_elements = document.querySelectorAll("[data-store]");

			input_elements.forEach((input_element) => {
				// Gather data about the element.
				// Get the corresponding storage data.

				let element = {};
				element[`type`] = input_element.getAttribute(`type`).toLowerCase();
				element[`event`] = function () {};
				switch (element[`type`]) {
					case `checkbox`:
						element[`event`] = function () {
							let UI_item = {};
							UI_item[`source`] = this.getAttribute(`data-store`);
							UI_item[`value`] = this.checked;
							UI_item[`store`] = (this.hasAttribute(`data-store-location`)) ? parseInt(this.getAttribute(`data-store-location`)) : -1;
							secretariat.global.write(UI_item[`source`], UI_item[`value`], UI_item[`store`]);
						};
						break;
					default:
						element[`event`] = function () {
							let UI_item = {};
							UI_item[`source`] = this.getAttribute(`data-store`);

							if (element[`type`].includes(`num`) || element[`type`].includes(`range`)) {
								if ((this.hasAttribute(`min`)) ? this.value < parseFloat(this.getAttribute(`min`)) : false) {
									this.value = this.getAttribute(`min`);
								} else if((this.hasAttribute(`max`)) ? this.value > parseFloat(this.getAttribute(`max`)) : false) {
									this.value = this.getAttribute(`max`);
								};
							};

							UI_item[`value`] = element[`type`].includes(`num`)
								? this.value % parseInt(this.value) != 0
									? parseFloat(this.value)
									: parseInt(this.value)
								: this.value;
							UI_item[`store`] = (this.hasAttribute(`data-store-location`)) ? parseInt(this.getAttribute(`data-store-location`)) : -1;
							secretariat.global.write(UI_item[`source`], UI_item[`value`], UI_item[`store`]);
						};
						break;
				}

				input_element.addEventListener(`change`, element[`event`]);
			});
		}
		
		/*
			Update the interface based on the storage data changes.
		*/
		async function updates() {
			// Get the storage data.
			let storage_data = await secretariat.global.read();

			async function enable() {
				let input_elements = document.querySelectorAll("[data-enable]");

				if (input_elements) {
					input_elements.forEach(async (input_element) => {
						if (input_element.getAttribute("data-enable")) {
							// Enable the element.
							input_element.disabled = ((await secretariat.global.read(input_element.getAttribute("data-enable"))) != null
								? (typeof (await secretariat.global.read(input_element.getAttribute("data-enable")))).includes(`obj`)
									? (Object.keys(await secretariat.global.read(input_element.getAttribute("data-enable")))).length <= 0
									: !(!!(await secretariat.global.read(input_element.getAttribute("data-enable"))))
								: true);
							(input_element.disabled) ? input_element.classList.add(`disabled`) : input_element.classList.remove(`disabled`);

							// If it is under a list element (usually in navigation bars), then also disable that element too. 
							if ((input_element.parentElement.nodeName.toLowerCase()).includes(`li`)) {
								input_element.parentElement.disabled = input_element.disabled;
								(input_element.disabled) ? input_element.parentElement.classList.add(`disabled`) : input_element.parentElement.classList.remove(`disabled`);
							}
						}
					});
				}
			}

			// Update the input elements.
			secretariat.observe((what) => {
				enable();
			});

			enable();
		};
		
		/* Enable the searching interface. */
		async function search() {
			const search_GUI_manager = (await import(chrome.runtime.getURL(`scripts/GUI/builder/windowman.search.js`))).default;
			return (search_GUI_manager.Search());
		};

		fill();
		update();
		updates();
		this[`search`] = search();
	}
}