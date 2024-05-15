/* windowman
Window and window content management */

import texts from "/scripts/mapping/read.js";
import Tabs from "/scripts/GUI/tabs.js";
import {global, observe} from "/scripts/secretariat.js";
import {URLs} from "/scripts/utils/URLs.js";
import wait from "/scripts/utils/wait.js";
import UI from "/scripts/GUI/builder/windowman.search.js";

export default class windowman {
	elements = {};

	static new(URL, height, width) {
		this.window = chrome.windows.create({url: (URL.includes(`://`)) ? URL :  chrome.runtime.getURL(URL), type: "popup", width: width ? parseInt(width) : 600, height: height ? parseInt(height) : 600});
	}

	// Prepare the window with its metadata.
	constructor(OPTIONS) {
		const headers = (OPTIONS) => {
			let LOAD_STATE = true;
			let UI = {
				"CSS": ["/styles/external/fonts/materialdesignicons.min.css", "/styles/external/materialize/css/materialize.css", "/styles/ui.css"],
				"scripts": ["/styles/external/materialize/js/materialize.js"]
			};

			// Add additional sources. 
			((OPTIONS && (typeof OPTIONS).includes(`obj`)) ? Object.keys(OPTIONS).length : false)
				? (Object.keys(OPTIONS).forEach((key) => {
					(Object.hasOwn(UI, key))
						? ((Array.isArray(OPTIONS[key]))
							? UI[key] = [...UI[key], ...OPTIONS[key]]
							: UI[key].push(OPTIONS[key]))
						: null;
				}))
				: null;

			(UI[`CSS`]).forEach(async (source) => {
				let METADATA = {
					"href": source,
					"rel": "stylesheet",
					"type": "text/css"
				};

				let ELEMENT = document.createElement(`link`);
				(Object.keys(METADATA)).forEach((key) => {
					ELEMENT.setAttribute(key, METADATA[key]);
				});

				document.querySelector(`head`).appendChild(ELEMENT);
			});

			((UI[`scripts`] && Array.isArray(UI[`scripts`])) ? UI[`scripts`].length : false)
				? (UI[`scripts`]).forEach(async (source) => {
					let METADATA = {
						"src": source
					};

					let ELEMENT = document.createElement(`script`);
					(Object.keys(METADATA)).forEach((key) => {
						ELEMENT.setAttribute(key, METADATA[key]);
					});
					document.querySelector(`head`).appendChild(ELEMENT);
				})
				: false;

			this.header = UI;
		};

		
		
		// Get the window.
		this[`metadata`] = chrome.windows.getCurrent();
		
		headers(((OPTIONS != null && typeof OPTIONS == `object`) ? OPTIONS[`headers`] : false) ? OPTIONS[`headers`] : null);
		this.design();
	}

	/*
	Automatically set the design based on expected fields. 
	*/
	design () {
		/* Fill in data and events.  */
		function appearance() {
			// Add buttons elements.
			function buttons() {
				let INTERACTIVE_ELEMENTS = {};

				const SOURCES = {
					"buttons": "button",
					"links": "a",
					"text boxes": `textarea, input:not([type="checkbox"]):not([type="radio"]):not([type="range"])`
				};

				(Object.keys(SOURCES)).forEach((TYPE) => {
					INTERACTIVE_ELEMENTS[TYPE] = document.querySelectorAll(SOURCES[TYPE]);	

					// Add the style as well. 
					INTERACTIVE_ELEMENTS[TYPE].forEach((ELEMENT) => {
						(ELEMENT.classList ? ELEMENT.classList.contains(`waves-effect`) : true)
							? ELEMENT.classList.add(`waves-effect`)
							: false;
					})
				});

				(INTERACTIVE_ELEMENTS[`buttons`] ? INTERACTIVE_ELEMENTS[`buttons`].length : false)
					? INTERACTIVE_ELEMENTS[`buttons`].forEach((BUTTON) => {
						(!BUTTON.classList.contains(`btn`)) 
							? BUTTON.classList.add(`btn`)
							: false;
					})
					: false;

				return INTERACTIVE_ELEMENTS;
			}

			function icons() {
				let TARGET_ELEMENTS = document.querySelectorAll(`[data-icon]`);
				
				(TARGET_ELEMENTS).forEach((element) => {
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

				return TARGET_ELEMENTS;
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

				Object.keys(text_elements).forEach((key) => {
					if (text_elements[key] && !key.includes(`content`)) {
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

				return text_elements;
			};

			function sidenav() {
				let SIDENAV_ALL = document.querySelectorAll(`.sidenav`);
				let SIDENAV = {};

				if (SIDENAV_ALL ? SIDENAV_ALL.length : false) {
					SIDENAV_ALL.forEach((SIDEBAR_ELEMENT) => {
						if (!(SIDEBAR_ELEMENT.getAttribute(`name`))) {
							SIDEBAR_ELEMENT.setAttribute(`name`, `sidebar-`.concat(Math.floor(Math.random() * 1000)));
						}

						SIDENAV[SIDEBAR_ELEMENT.getAttribute(`name`)] = SIDEBAR_ELEMENT;
						SIDENAV[SIDEBAR_ELEMENT.getAttribute(`name`)][`trigger`] = [...document.querySelectorAll(`[works-sidebar="${SIDEBAR_ELEMENT.getAttribute(`name`)}"]`), ...document.querySelectorAll(`[data-action="ui,open,navbar"]`)];

						(SIDENAV[SIDEBAR_ELEMENT.getAttribute(`name`)][`trigger`] ? SIDENAV[SIDEBAR_ELEMENT.getAttribute(`name`)][`trigger`].length : false)
							? (SIDENAV[SIDEBAR_ELEMENT.getAttribute(`name`)][`trigger`]).forEach((TRIGGER_ELEMENT) => {
								TRIGGER_ELEMENT.addEventListener(`click`, () => {
									M.Sidenav.getInstance(SIDENAV[SIDEBAR_ELEMENT.getAttribute(`name`)]).open();
								})
							})
							: false;
					});
				}

				return SIDENAV;
			}

			let ELEMENTS = {};
			ELEMENTS[`interactive`] = buttons();
			ELEMENTS[`texts`] = text();
			ELEMENTS[`icons`] = icons();
			ELEMENTS[`sidenav`] = sidenav();

			return (ELEMENTS);
		}

		// Adds events to the window.
		const events = () => {
			const links = () => {
				(this[`elements`][`interactive`][`buttons`] ? this[`elements`][`interactive`][`buttons`].length : false)
					? this[`elements`][`interactive`][`buttons`].forEach((button) => {
						if (button.hasAttribute(`href`)) {
							// Get the data from the button.
							let TARGET = {};
							TARGET[`source`] = button.getAttribute(`href`);
							TARGET[`dimensions`] = {};

							// Get the dimensions of the window.
							[`height`, `width`].forEach((DIMENSION) => {
								TARGET[`dimensions`][DIMENSION] = (button.getAttribute(`tab-`.concat(DIMENSION)))
									? parseInt(button.getAttribute(`tab-`.concat(DIMENSION)))
									: null;

								(button.getAttribute(`tab-`.concat(DIMENSION)))
									? button.removeAttribute(`tab-`.concat(DIMENSION))
									: false;
							})

							// Get the path of the target.
							TARGET[`path`] = (
								!URLs.test(TARGET[`source`])
									? window.location.pathname.split(`/`).slice(0, -1).join(`/`).concat(`/`)
									: ``
							).concat(TARGET[`source`]);
							
							// Set the event itself. 
							const event = () => {
								// Open the window as a popup. 
								Tabs.create(TARGET[`path`]);
							};
							button.addEventListener(`click`, event);
						}
					})
					: false;
			}

			const actions = () => {
				let TYPE = `action`;
				this.elements[`interactive`][TYPE] = (this.elements[`interactive`][TYPE]) ? this.elements[`interactive`][TYPE] : {};

				document.querySelector(`[data-${TYPE}]`)
					? document.querySelectorAll(`[data-${TYPE}]`).forEach((ELEMENT) => {
						// Store the button. 
						this.elements[`interactive`][TYPE][ELEMENT.getAttribute(`data-${TYPE}`)] = ((this.elements[`interactive`][TYPE][ELEMENT.getAttribute(`data-${TYPE}`)]))
							? this.elements[`interactive`][TYPE][ELEMENT.getAttribute(`data-${TYPE}`)]
							: document.querySelectorAll(`[data-${TYPE}="${ELEMENT.getAttribute(`data-${TYPE}`)}"]`);

						// Remove the property. 
						(!(TYPE.includes(`store`))) ? ELEMENT.removeAttribute(`data-${TYPE}`) : false;
					})
					: false;
			}

			links();
			actions();
		}

		this[`elements`] = appearance();
		events();
	}

	/* Run this function if you would like to synchronize with data. */
	async sync() {
		// Prepare flags. 
		this[`state`] = {};
		this[`state`][`read/write`] = 0;

		// Set the linked elements. 
		this[`elements`][`linked`] = (this[`elements`][`linked`]) ? this[`elements`][`linked`] : {};

		const fill = () => {
			const store = () => {
				let ELEMENTS = document.querySelectorAll("[data-store]");
				
				if (ELEMENTS ? ELEMENTS.length : false) {
					// Add the linked elements. 
					this[`elements`][`linked`][`show`] = (this[`elements`][`linked`][`show`]) ? this[`elements`][`linked`][`show`] : {};
	
					ELEMENTS.forEach((input_element) => {
						// Gather data about the element.
						let data = {};
						data[`source`] = input_element.getAttribute(`data-store`);
	
						// Store the remaining data about the element. 
						input_element[`storage`] = {};
						input_element[`storage`][`source`] = (input_element.hasAttribute(`data-store-location`)) ? parseInt(input_element.getAttribute(`data-store-location`)) : -1;
						input_element.removeAttribute(`data-store-location`);
		
						(this[`elements`][`linked`][`show`][data[`source`]] ? this[`elements`][`linked`][`show`][data[`source`]].length : false)
							? this[`elements`][`linked`][`show`][data[`source`]].push(input_element)
							: this[`elements`][`linked`][`show`][data[`source`]] = [input_element];	

						// Remove the attribute.
						input_element.removeAttribute(`data-store`);
					});	
				};

				// Wait until this[`state`][`read/write`] is >= 0; don't clash. 
				wait((this[`state`][`read/write`] ? this[`state`][`read/write`] >= 0 : true)).then(() => {
					(this[`elements`][`linked`][`show`] ? Object.keys(Object.keys(this[`elements`][`linked`][`show`])).length : false)
						? (Object.keys(this[`elements`][`linked`][`show`])).forEach((SOURCE) => {
							(this[`elements`][`linked`][`show`][SOURCE] ? this[`elements`][`linked`][`show`][SOURCE].length : false) 
								? global.read(SOURCE).then((value) => {
									(this[`elements`][`linked`][`show`][SOURCE]).forEach((ELEMENT) => {
										switch (ELEMENT.getAttribute(`type`).toLowerCase()) {
											case `checkbox`:
												ELEMENT.checked = value;
												break;
											case `progress`:
											case `range`:
												// Ensure that it is a positive floating-point number.
												value = !value ? 0 : Math.abs(parseFloat(value));
												value = (value > 100) ? value / 100 : value;
			
												// Set the attribute of the progress bar.
												ELEMENT.setAttribute(`value`, value);
												ELEMENT.setAttribute(`max`, 1);
												break;
											default:
												ELEMENT.value = value ? value : ``;
												break;
										};	
									})
								})
								: false;
							
						})
						: false;
				})
			}

			const enable = () => {
				// Get enabled elements. 
				let ELEMENTS = document.querySelectorAll("[data-enable]");
				if (ELEMENTS ? ELEMENTS.length : false) {
					// Add the linked elements.
					this[`elements`][`linked`][`enable`] = (this[`elements`][`linked`][`enable`]) ? this[`elements`][`linked`][`enable`] : {};

					ELEMENTS.forEach(async (input_element) => {
						if (input_element.getAttribute(`data-enable`)) {
							// Get the source of the element.
							let SOURCE = input_element.getAttribute(`data-enable`);

							// Put the element into the linked elements list.
							(this[`elements`][`linked`][`enable`][SOURCE] ? this[`elements`][`linked`][`enable`][SOURCE].length : false)
								? this[`elements`][`linked`][`enable`][SOURCE].push(input_element)
								: this[`elements`][`linked`][`enable`][SOURCE] = [input_element];

							// Remove the attribute.
							input_element.removeAttribute(`data-enable`);
						}
					});
				};

				(this[`elements`][`linked`][`enable`] ? Object.keys(Object.keys(this[`elements`][`linked`][`enable`])).length : false)
					? (Object.keys(this[`elements`][`linked`][`enable`])).forEach((SOURCE) => {
						((this[`elements`][`linked`][`enable`][SOURCE]) ? this[`elements`][`linked`][`enable`][SOURCE].length : false) 
							? global.read(SOURCE).then((DATA) => {
								(this[`elements`][`linked`][`enable`][SOURCE]).forEach((input_element) => {
									// Enable the element.
									input_element.disabled = ((DATA) != null
										? (typeof (DATA)).includes(`obj`)
											? ((Array.isArray(DATA) ? DATA.length : (Object.keys(DATA)).length) <= 0)
											: ((typeof DATA).includes(`bool`) ? false : !(!!(DATA)))
										: true);
									input_element.classList[(input_element.disabled) ? `add` : `remove`](`disabled`);

									// If it is under a list element (usually in navigation bars), then also disable that element too. 
									if ((input_element.parentElement.nodeName.toLowerCase()).includes(`li`)) {
										input_element.parentElement.disabled = input_element.disabled;
										input_element.parentElement.classList[(input_element.disabled) ? `add` : `remove`](`disabled`);
									}
								});
							})
							: false;
					})
					: false;
			}

			store();
			enable();
		}
		
		/* Add events related to storage. */
		const write = async () => {
			if (this[`elements`][`linked`][`show`] ? Object.keys(this[`elements`][`linked`][`show`]).length : false) {
				Object.keys(this[`elements`][`linked`][`show`]).forEach((SOURCE) => {
					(this[`elements`][`linked`][`show`][SOURCE] ? this[`elements`][`linked`][`show`][SOURCE].length : false)
						? this[`elements`][`linked`][`show`][SOURCE].forEach((ELEMENT) => {
							ELEMENT[`type`] = ELEMENT.getAttribute(`type`).toLowerCase();
							ELEMENT[`event`] = function () {};

							switch (ELEMENT[`type`]) {
								case `checkbox`:
									ELEMENT[`event`] = () => {
										// Set flag to prevent reading. 
										this[`state`][`read/write`] = -1;
										global.write(SOURCE, ELEMENT.checked, ELEMENT[`storage`][`source`]);
										
										// Unlock reading. 
										this[`state`][`read/write`] = 0;
									};
									break;
								default: 
									ELEMENT[`event`] = () => {
										// Set flag to write to prevent reading.
										this[`state`][`read/write`] = -1;

										if (ELEMENT[`type`].includes(`num`) || ELEMENT[`type`].includes(`range`)) {
											ELEMENT.value = ((((ELEMENT.hasAttribute(`min`)) ? ELEMENT.value < parseFloat(ELEMENT.getAttribute(`min`)) : false))
												? ELEMENT.getAttribute(`min`)
												: (((ELEMENT.hasAttribute(`max`)) ? ELEMENT.value > parseFloat(ELEMENT.getAttribute(`max`)) : false)
													? ELEMENT.getAttribute(`max`)
													: ELEMENT.value))
										};

										let VALUE = ELEMENT[`type`].includes(`num`)
											? (ELEMENT.value % parseInt(ELEMENT.value) != 0
												? parseFloat(ELEMENT.value)
												: parseInt(ELEMENT.value))
											: ELEMENT.value;

										global.write(SOURCE, VALUE, ELEMENT[`storage`][`source`]);

										// Finish writing. 
										this[`state`][`read/write`] = 0;
									};
									break;
							};

							ELEMENT.addEventListener(`change`, ELEMENT[`event`]);
						})
						: false;
				});
			}
		};
		
		/*
		Instantiate the extras. 
		*/
		const extras = () => {
			// Add the search interface. 
			(Object.keys(UI)).forEach((FEATURE) => {
				this[FEATURE] = new UI[FEATURE]();
			})
		}
		
		fill();
		write();
		extras();
		
		// Update the input elements.
		observe((what) => {
			fill();
		});
	}
}