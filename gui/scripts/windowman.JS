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
	async sync() {
		// Import the module.
		const secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));
		const alerts = (await import(chrome.runtime.getURL(`/gui/scripts/alerts.js`))).default;
		
		async function fill() {
			let input_elements = document.querySelectorAll("[data-store]");

			input_elements.forEach(function(input_element) {
				// Gather data about the element.
				// Get the corresponding storage data.
				let data = {};
				data[`source`] = input_element.getAttribute(`data-store`);
				data[`origin`] = (input_element.hasAttribute(`data-store-location`)) ? parseInt(input_element.getAttribute(`data-store-location`)) : -1
				data[`value`] = secretariat.read(data[`source`], data[`origin`]);

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
					}
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
							secretariat.write(UI_item[`source`], UI_item[`value`], UI_item[`store`]);
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
							secretariat.write(UI_item[`source`], UI_item[`value`], UI_item[`store`]);
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
								if ((input_element.parentElement.nodeName.toLowerCase()).includes(`li`)) {
									input_element.parentElement.disabled = input_element.disabled;
								}
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
							// Set the target element to the correct data structure (lists). 
							TARGET_NAME = (!Array.isArray(TARGET_NAME)) ? TARGET_NAME.split(`,`) : TARGET_NAME;
							
							// Clear the target element.
							ELEMENT_TARGET.innerHTML = ``;

							function setSelected(element) {
								SEARCH[TARGET_NAME][`selected`] = (element) ? (Object.keys(RESULTS))[(Array.prototype.slice.call(element.parentElement.parentElement.querySelectorAll(`a`))).indexOf(element)] : null;
								
								// Array.prototype.slice.call(element.parentElement.children)
								if (element) {(element.parentElement).parentElement.querySelectorAll(`li`).forEach((element_others) => {
									element_others.classList.remove(`active`);
								}); element.parentElement.classList.add(`active`)};							
							}

							// Display the results.
							if ((RESULTS != null && (typeof RESULTS).includes(`obj`) && !Array.isArray(RESULTS)) ? Object.keys(RESULTS).length > 0 : false) {
								let ACCESS_KEYS = {"top": ["1", "2", "3", "4", "5", "6", "7", "8", "9"], "nav": ["<", ">"]};
								(Object.keys(RESULTS)).forEach((result) => {
									let result_element = document.createElement(`li`);
									let result_title = document.createElement(`a`);
									result_title.classList.add(`waves-effect`);
									result_title.innerText = (RESULTS[result][TITLE_FIELD]) ? RESULTS[result][TITLE_FIELD] : result;
									
									function accessKey(ELEMENT) {
										if (!ELEMENT) {
											let RESULT_INDEX = (Object.keys(RESULTS)).indexOf(result);
											if (RESULT_INDEX < ACCESS_KEYS[`top`].length) {
												result_title.setAttribute(`accesskey`, ACCESS_KEYS[`top`][RESULT_INDEX]);
											}
										} else {
											let ELEMENT_INDEX = (new Array((ELEMENT.parentElement).querySelectorAll(`*`))).indexOf(ELEMENT);
											if (ELEMENT_INDEX >= ACCESS_KEYS[`top`].length) {
												if (((ELEMENT.parentElement).querySelectorAll(`*`)).length > ELEMENT_INDEX + 1) {
													((ELEMENT.parentElement).querySelectorAll(`*`))[ELEMENT_INDEX + 1].setAttribute(`accesskey`, ACCESS_KEYS[`nav`][1])
												};
												if ((((ELEMENT.parentElement).querySelectorAll(`*`))[ELEMENT_INDEX - 1].getAttribute(`accesskey`)) ? !(ACCESS_KEYS[`top`].includes(((ELEMENT.parentElement).querySelectorAll(`*`))[ELEMENT_INDEX - 1].getAttribute(`accesskey`))) : true) {
													((ELEMENT.parentElement).querySelectorAll(`*`))[ELEMENT_INDEX - 1].setAttribute(`accesskey`, ACCESS_KEYS[`nav`][1])
												};
												// Set the quick return access key. 
												ELEMENT.setAttribute(`accesskey`, `0`);
											} 
										}
									}

									result_title.addEventListener(`click`, function () {
										setSelected(this);
										pick(result, RESULTS[result], TARGET_NAME);

										// Set the access key.
										accessKey(this);
									});
									
									accessKey();
									result_element.appendChild(result_title);
									ELEMENT_TARGET.appendChild(result_element);

									if ((SEARCH[TARGET_NAME]) ? SEARCH[TARGET_NAME][`selected`] == result : false) {
										setSelected(result_title);
										pick(result, RESULTS[result], TARGET_NAME);
									}
								});
							}
						});
					}
				}

				/* Function to execute when a search result item has been picked. 

				@param {string} NAME the name of the currently selected data
				@param {object} ITEM the item picked
				@param {string} AREA the ID of the search
				*/
				async function pick(NAME, ITEM, AREA) {
					if (AREA) {
						let CONTAINERS = (document.querySelectorAll(`[data-result-linked="${AREA}"]`));
					
						if (CONTAINERS) {
							(CONTAINERS).forEach((CONTAINER) => {
								CONTAINER.disabled = (ITEM != null) ? !((typeof ITEM).includes(`obj`) && !Array.isArray(ITEM)) : true;
								([].concat(CONTAINER.querySelectorAll(`[data-result-content]`), CONTAINER.querySelectorAll(`[data-result-store]`), document.querySelectorAll(`[data-result-enable]`))).forEach(async function (ELEMENTS) {
									if (ELEMENTS) {
										(ELEMENTS).forEach(async function(ELEMENT) {
											ELEMENT.disabled = CONTAINER.disabled;
											if (!ELEMENT.disabled) {
												if (ELEMENT.getAttribute(`data-result-store`) && ELEMENT.type) {
													// Init updater function.
                                                    ELEMENT[`function`] = function() {};
                                                    
													var DATA = {};

													DATA[`target`] = ((ELEMENT.getAttribute(`data-result-store`).split(`,`))[0] == ``) ? [...(ELEMENT.getAttribute(`data-result-store`).split(`,`).slice(1)), ...[NAME]] : [...AREA, ...[NAME], ...(ELEMENT.getAttribute(`data-result-store`).split(`,`))];
													DATA[`value`] = ((Object.keys(ITEM).includes(ELEMENT.getAttribute(`data-result-store`))) ? ITEM[ELEMENT.getAttribute(`data-result-store`)] : await secretariat.read(DATA[`target`], (ELEMENT.hasAttribute(`data-store-location`)) ? parseInt(ELEMENT.getAttribute(`data-store-location`)) : -1));

													switch (ELEMENT[`type`]) {
														case `checkbox`:
															ELEMENT.checked = (DATA[`value`]);
															
															ELEMENT[`function`] = function() {
																DATA[`target`] = ((ELEMENT.getAttribute(`data-result-store`).split(`,`))[0] == ``) ? [...(ELEMENT.getAttribute(`data-result-store`).split(`,`).slice(1)), ...[NAME]] : [...AREA, ...[NAME], ...(ELEMENT.getAttribute(`data-result-store`).split(`,`))];
																secretariat.write(DATA[`target`], ELEMENT.checked, (ELEMENT.hasAttribute(`data-store-location`)) ? parseInt(ELEMENT.getAttribute(`data-store-location`)) : -1);
															};
															break;
														default:
															if ((typeof (ITEM[ELEMENT.getAttribute(`data-result-store`)])).includes(`obj`)) {
																ELEMENT.value = JSON.stringify(DATA[`value`]);

																ELEMENT[`function`] = function() {
																	try {
																		DATA[`target`] = ((ELEMENT.getAttribute(`data-result-store`).split(`,`))[0] == ``) ? [...(ELEMENT.getAttribute(`data-result-store`).split(`,`).slice(1)), ...[NAME]] : [...AREA, ...[NAME], ...(ELEMENT.getAttribute(`data-result-store`).split(`,`))];
																		DATA[`value`] = JSON.parse(ELEMENT.value.trim());
																		secretariat.write(DATA[`target`], DATA[`value`], (ELEMENT.hasAttribute(`data-store-location`)) ? parseInt(ELEMENT.getAttribute(`data-store-location`)) : -1);
																	} catch(err) {
																		// The JSON isn't valid.
																		alerts.error(err.name, texts.localized(`JSON_parse_error`), err.stack, false);
																	};
																}
															} else {
																ELEMENT.value = DATA[`value`];

																ELEMENT[`function`] = function() {
																	DATA[`target`] = ((ELEMENT.getAttribute(`data-result-store`).split(`,`))[0] == ``) ? [...(ELEMENT.getAttribute(`data-result-store`).split(`,`).slice(1)), ...[NAME]] : [...AREA, ...[NAME], ...(ELEMENT.getAttribute(`data-result-store`).split(`,`))];
																	secretariat.write(DATA[`target`], ELEMENT.value.trim(), (ELEMENT.hasAttribute(`data-store-location`)) ? parseInt(ELEMENT.getAttribute(`data-store-location`)) : -1);
																}
															}
															break;
													}

													if (ELEMENT.nodeName.toLowerCase().includes(`textarea`)) {
														ELEMENT.addEventListener(`blur`, ELEMENT[`function`]);
													} else {
														ELEMENT.addEventListener(`change`, ELEMENT[`function`]);
													}
												} else if (ELEMENT.getAttribute(`data-result-content`) || ELEMENT.getAttribute(`data-result-store`)) {
													ELEMENT.innerText = (ITEM[ELEMENT.getAttribute(`data-result-content`)] || ELEMENT.getAttribute(`data-result-content`).includes(`*`))
													? ((ELEMENT.getAttribute(`data-result-content`).includes(`*`))
														? NAME
														: ITEM[ELEMENT.getAttribute(`data-result-content`)])
													: ((ITEM[ELEMENT.getAttribute(`data-result-store`)])
														? (ITEM[ELEMENT.getAttribute(`data-result-store`)])
														:  null) /*secretariat.read(((ITEM[(ELEMENT.getAttribute(`data-result-store`).split(`,`))])[ITEM])));*/
												}
											} else {
												if (ELEMENT.getAttribute(`data-result-store`) && ELEMENT.type) {
													switch (ELEMENT[`type`]) {
														case `checkbox`:
															ELEMENT.checked = false;
															break;
														case `range`: 
														case `number`: 
															ELEMENT.value = 0;
															break;
														default:
															ELEMENT.value = ``;
															break;
													}
												} else if (ELEMENT.getAttribute(`data-result-content`) || ELEMENT.getAttribute(`data-result-store`)) {
													ELEMENT.innerText = ``;
												}

												// Disable the list element if in case it is a clickable element. 
												if ((ELEMENT.parentElement.nodeName.toLowerCase()).includes(`li`)) {
													ELEMENT.parentElement.disabled = CONTAINER.disabled;
												}
											};
										})
									}
								})
							})
						}
					}
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
								
								// Return the selected result. 
								return await secretariat.read(element.getAttribute(`data-result`));
							})();
						}
						display(element.getAttribute(`data-result`), SEARCH[element.getAttribute(`data-result`)][`results`], `name`);
						
                        if ((
							!(SEARCH[element.getAttribute(`data-result`)][`selected`])
								|| (typeof SEARCH[element.getAttribute(`data-result`)][`results`]).includes(`obj`) && SEARCH[element.getAttribute(`data-result`)][`results`] != null)
							? (((SEARCH[element.getAttribute(`data-result`)][`results`] != null) ? (Object.keys(SEARCH[element.getAttribute(`data-result`)][`results`]).length <= 0) : false)
								|| !((SEARCH[element.getAttribute(`data-result`)][`selected`])))
							: true)
						{
							pick(null, null, element.getAttribute(`data-result`));
						}

						secretariat.observe((what) => {
							find(element);
						});
					}
				}

				document.querySelectorAll(`[data-result]`).forEach((element) => {
					/* GUI changes to find
					
					@param {object} ELEMENT the element to change
					*/
					
                    element.addEventListener(`change`, async function () {find(element)});
					find(element);
				});

				return (SEARCH);
			}
		}

		fill();
		update();
		updates();
		this[`search`] = search();
	}
}

export { windowman };
