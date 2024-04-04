/* windowman
Window and window content management */

import texts from "./read.js";

// MAKE SURE TO TURN THIS OFF DURING BUILD.
let DEBUG = false;

export default class windowman {
	static new(URL, height, width) {
		this.window = chrome.windows.create({
			url: chrome.runtime.getURL(URL),
			type: "popup",
			width: width ? parseInt(width) : 600,
			height: height ? parseInt(height) : 600,
		});
	}

	// Prepare the window with its metadata.
	constructor() {
		function headers() {
			let LOAD_STATE = true;
			let UI = {
				CSS: [
					chrome.runtime.getURL("gui/styles/external/fonts/materialdesignicons.min.css"),
					chrome.runtime.getURL("gui/styles/external/materialize/css/materialize.css"),
					chrome.runtime.getURL("gui/styles/ui.css"),
				]
			};

			for (let index = 0; index < UI[`CSS`].length; index++) {
				const source = UI.CSS[index];

				try {
					(async () => {
						// Import source reading for later. 
						const reader = (await import(chrome.runtime.getURL(`/gui/scripts/read.js`))).default;
						
						const net = await import(chrome.runtime.getURL(`/scripts/net.js`));

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
							throw new ReferenceError(reader.localized(`error_msg_fileNotFound`));
						}
						
					})();
				} catch(err) {
					(async() => {
						const alerts = (await import(chrome.runtime.getURL(`/gui/scripts/alerts.js`))).default;
						
						// Raise an alert. 
						alerts.error(err.name, err.message, err.stack, true, [source]);

						// Stop loading the page when an error has occured; it's not going to work!
						if (!DEBUG) {
							window.close();
						}
					})();
					
					// Stop loading immediately during the error. 
					break;
				};
			}
		}

		// Get the window.
		this[`metadata`] = chrome.windows.getCurrent();

		/*
		window_metadata[`id`] = window.id;
		window_metadata[`focused`] = window.focused;
		window_metadata[`state`] = window.state;
		window_metadata[`type`] = window.type;
		window_metadata[`incognito`] = window.incognito;
		window_metadata[`alwaysOnTop`] = window.alwaysOnTop;
		window_metadata[`sessionId`] = window.sessionId;
		window_metadata[`tabs`] = window.tabs;*/

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
						.concat(
							document.querySelectorAll(`a`)
								? document.querySelectorAll(`a`)
								: [],
							document.querySelectorAll(`button`)
								? document.querySelectorAll(`button`)
								: [],
							document.querySelectorAll(`textarea`)
								? document.querySelectorAll(`textarea`)
								: [],
							document.querySelectorAll(`input:not([type="checkbox"]):not([type="radio"]):not([type="range"])`)
								? document.querySelectorAll(`input:not([type="checkbox"]):not([type="radio"]):not([type="range"])`)
								: []
						)
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

					swap();
					iconify();
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
							let event = function () {
								// Get the data from the button.
								let target = {};
								target[`source`] = this.getAttribute(`href`);

								// Get the correct path.
								target[`path`] = (
									!target[`source`].includes(`://`)
										? window.location.pathname
												.split(`/`)
												.slice(0, -1)
												.join(`/`)
												.concat(`/`)
										: ``
								).concat(target[`source`]);

								windowman.new(
									target[`path`],
									this.getAttribute(`tab-height`)
										? this.getAttribute(`tab-height`)
										: null,
									this.getAttribute(`tab-width`)
										? this.getAttribute(`tab-width`)
										: null,
								);
							};
							button.addEventListener("click", event);
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
									.addEventListener(`click`, function () {
										M.Sidenav.getInstance(sidebar_element).open();
									});
								} else if (document.querySelector(`[data-action="ui,open,navbar"]`)) {
									document.querySelector(`[data-action="ui,open,navbar"]`).forEach(function (button_element) {
										button_element.addEventListener(`click`, function() {
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

		headers();
		appearance();
		events();
	}

	/* Run this function if you would like to synchronize with data. */
	sync() {
		async function fill() {
			// Import the module.
			const secretariat = await import(
				chrome.runtime.getURL("scripts/secretariat.js")
			);

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
					}
				});
			});
		}
		
		/* Add events related to storage. */
		async function update() {
			// Import the module.
			const secretariat = await import(
				chrome.runtime.getURL("scripts/secretariat.js")
			);

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
							secretariat.write(UI_item[`source`], UI_item[`value`]);
						};
						break;
					default:
						element[`event`] = function () {
							let UI_item = {};
							UI_item[`source`] = this.getAttribute(`data-store`);
							UI_item[`value`] = element[`type`].includes(`num`)
								? parseFloat(this.value) % 1 != 0
									? parseFloat(this.value)
									: parseInt(this.value)
								: this.value;
							secretariat.write(UI_item[`source`], UI_item[`value`]);
						};
						break;
				}

				input_element.addEventListener("change", element[`event`]);
			});
		}
		
		/*
			Update the interface based on the storage data changes.
		*/
		async function updates() {
			// Import the module.
			const secretariat = await import(
				chrome.runtime.getURL("scripts/secretariat.js")
			);

			// Get the storage data.
			let storage_data = await secretariat.read();

			async function enable() {
				let input_elements = document.querySelectorAll("[data-enable]");

				if (input_elements) {
					input_elements.forEach((input_element) => {
						if (input_element.getAttribute("data-enable")) {
							(async () => {
								input_element.disabled = !((await secretariat.read(input_element.getAttribute("data-enable"))) != null
									? (typeof (await secretariat.read(input_element.getAttribute("data-enable")))).includes(`obj`)
										? (Object.keys(await secretariat.read(input_element.getAttribute("data-enable")))).length > 0
										: !!(await secretariat.read(
												input_element.getAttribute("data-enable"),
											))
									: false);
							})();
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
		function search() {
			if (document.querySelectorAll(`[data-result]`)) {
				/* 
					Display the search result. 
					
					@param {object} ELEMENT_TARGET the target element
					@param {object} RESULTS the results
					@param {object} TITLE_FIELD the title field for each result
				*/
				var SEARCH = {}; 

				function display(TARGET_NAME, RESULTS, TITLE_FIELD) {

					if (document.querySelectorAll(`[data-results-list="${TARGET_NAME}"]`)) {
						(document.querySelectorAll(`[data-results-list="${TARGET_NAME}"]`)).forEach(function (ELEMENT_TARGET) {
							// Clear the target element.
							ELEMENT_TARGET.innerHTML = ``;

							function setSelected(element) {
								SEARCH[TARGET_NAME][`selected`] = element.getAttribute(`data-result-linked`);
								(element.parentElement).parentElement.querySelectorAll(`li`).forEach((element_others) => {
									element_others.classList.remove(`active`);
								}); element.parentElement.classList.add(`active`);									
							}

							// Display the results.
							(Object.keys(RESULTS)).forEach((result) => {
								let result_element = document.createElement(`li`);
								let result_title = document.createElement(`a`);
								result_title.setAttribute(`data-result-linked`, result);
								result_title.classList.add(`waves-effect`);
								result_title.innerText = (RESULTS[result][TITLE_FIELD]) ? RESULTS[result][TITLE_FIELD] : result;

								result_title.addEventListener(`click`, function () {
									pick(RESULTS[result], TARGET_NAME);
									setSelected(this);
								});

								result_element.appendChild(result_title);
								ELEMENT_TARGET.appendChild(result_element);
								
								if (SEARCH[TARGET_NAME][`selected`] == result) {setSelected(result_title);}
							});
						});
					}
				}

				/* Function to execute when a search result item has been picked. 

				@param {object} ITEM the item picked
				@param {string} AREA the ID of this entire search thing
				*/
				function pick(ITEM, AREA) {
					
					console.log(ITEM, AREA);
				}
				
				async function find(element) {
					if (element.getAttribute(`data-result`)) {
						if (!SEARCH[element.getAttribute(`data-result`)]) {
							SEARCH[element.getAttribute(`data-result`)] = {};
						}
						SEARCH[element.getAttribute(`data-result`)][`criteria`] = element.value.trim();
						
						if (SEARCH[element.getAttribute(`data-result`)][`criteria`]) {
							if (
								element.getAttribute(`data-results-filters`)
									? element.getAttribute(`data-results-filters`).trim()
									: false
							) {
								SEARCH[element.getAttribute(`data-result`)][`additional criteria`] = element
									.getAttribute(`data-results-filters`)
									.split(`,`);
							}
							SEARCH[element.getAttribute(`data-result`)][`results`] = await (async () => {
								const secretariat = await import(
									chrome.runtime.getURL(`scripts/secretariat.js`)
								);

								return await secretariat.search(
									element.getAttribute(`data-result`),
									SEARCH[element.getAttribute(`data-result`)][`criteria`],
									SEARCH[element.getAttribute(`data-result`)][`additional criteria`],
								);
							})();
						} else {
							SEARCH[element.getAttribute(`data-result`)][`results`] = await (async () => {
								const secretariat = await import(
									chrome.runtime.getURL(`scripts/secretariat.js`)
								);

								return await secretariat.read(element.getAttribute(`data-result`));
							})();
						}
						display(element.getAttribute(`data-result`), SEARCH[element.getAttribute(`data-result`)][`results`], `name`);
					}

				}

				document.querySelectorAll(`[data-result]`).forEach((element) => {
					/* GUI changes to find
					
					@param {object} ELEMENT the element to change
					*/
						
					element.addEventListener(`change`, async function () {find(element)});
					find(element);
				});
				
				
			}
		}

		fill();
		update();
		updates();
		search();
	}
}

export { windowman };
