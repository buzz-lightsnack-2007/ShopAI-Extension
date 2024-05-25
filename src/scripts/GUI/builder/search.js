import {global, background} from "/scripts/secretariat.js";
import logging from "/scripts/logging.js"
import texts from "/scripts/mapping/read.js";
import nested from "/scripts/utils/nested.js";
import wait from "/scripts/utils/wait.js";

class Search {
	state = {};

	constructor () {
		if (document.querySelectorAll(`[data-result]`)) {
			this.#get();
			this.#set();
		};
	};

	/*
	Include all relevant DOM elements into this object.
	*/
	#get() {
		document.querySelectorAll(`[data-result]`).forEach((ELEMENT) => {
			let SOURCE = ELEMENT.getAttribute(`data-result`);

			if (SOURCE != `state`) {
				this[SOURCE] = (!this[SOURCE])
					? {}
					: this[SOURCE];

				const elements = () => {
					this[SOURCE][`elements`] = (this[SOURCE][`elements`]) ? this[SOURCE][`elements`] : {};

					// First, add the search box.
					this[SOURCE][`elements`][`search box`] = (this[SOURCE][`elements`][`search box`])
						? this[SOURCE][`elements`][`search box`].push(ELEMENT)
						: [ELEMENT];

					let SOURCES = {
						"results list": `[data-results-list="${SOURCE}"]`,
						"container": `[data-result-linked="${SOURCE}"]`,
						"enable": `[data-result-enable]`
					};

					const linked = () => {
						let LINKED_SOURCES = {
							"content": "data-result-content",
							"fields": "data-result-store"
						};

						(Object.keys(LINKED_SOURCES)).forEach((COMPONENT) => {
							(document.querySelector(SOURCES[`container`].concat(` [`, LINKED_SOURCES[COMPONENT], `]`)))
								? (document.querySelectorAll(SOURCES[`container`].concat(` [`, LINKED_SOURCES[COMPONENT], `]`))).forEach((ELEMENT) => {
									this[SOURCE][`elements`][COMPONENT] = (this[SOURCE][`elements`][COMPONENT] && !(Array.isArray(this[SOURCE][`elements`][COMPONENT])) && (typeof this[SOURCE][`elements`][COMPONENT]).includes(`obj`)) ? this[SOURCE][`elements`][COMPONENT] : {};

									// Get the name of the element.
									let NAME = ELEMENT.getAttribute(LINKED_SOURCES[COMPONENT]);
									(ELEMENT.getAttribute(`data-store-location`))
										? ELEMENT[`data store location`] = ELEMENT.getAttribute(`data-store-location`)
										: false;

									// Set the element.
									this[SOURCE][`elements`][COMPONENT][NAME] = (this[SOURCE][`elements`][COMPONENT][NAME] ? this[SOURCE][`elements`][COMPONENT][NAME].length : false)
										? (this[SOURCE][`elements`][COMPONENT][NAME].includes(ELEMENT)
											? false
											: [...this[SOURCE][`elements`][COMPONENT][NAME], ELEMENT])
										: [ELEMENT];


									// Remove the attribute.
									[LINKED_SOURCES[COMPONENT], `data-store-location`].forEach((ATTRIBUTE) => {
										ELEMENT.removeAttribute(ATTRIBUTE);
									})
								})
								: false;
						})
					}

					if (SOURCES ? Object.keys(SOURCES) : false) {
						(Object.keys(SOURCES)).forEach((COMPONENT) => {
							(document.querySelector(SOURCES[COMPONENT]))
								? this[SOURCE][`elements`][COMPONENT] = document.querySelectorAll(SOURCES[COMPONENT])
								: false;
						})
						linked();
					}
				}

				// Get relevant data.
				const attributes = () => {
					// Accumulate all search criteria where possible.
					(ELEMENT.hasAttribute(`data-results-filters`))
						? this[SOURCE][`additional criteria`] = (this[SOURCE][`additional criteria`]) ? [...this[SOURCE][`additional criteria`], ...ELEMENT.getAttribute(`data-results-filters`).split(`,`)] : ELEMENT.getAttribute(`data-results-filters`).split(`,`)
						: false;
					(ELEMENT.hasAttribute(`data-show`))
						? this[SOURCE][`preview`] = ELEMENT.getAttribute(`data-show`)
						: false;

					// Remove attributes only used during construction, simultaneously protecting against edited HTML from the debugger.
					[`data-result`, `data-results-filters`, `data-show`].forEach((ATTRIBUTE) => {
						ELEMENT.removeAttribute(ATTRIBUTE);
					});
				}

				elements();
				attributes();
			}
		});

	};

	/*
	Set the functions of the relevant elements.
	*/
	#set() {
		(Object.keys(this)).forEach((SOURCE) => {
			if (SOURCE != `state`) {
				this[SOURCE][`elements`][`search box`].forEach((ELEMENT) => {
					ELEMENT.addEventListener(`change`, () => {this.run({"name": SOURCE, "element": ELEMENT}, null, {"auto sync": true});});
				});

				// Set the state.
				this[SOURCE][`scripts`] = {"background": {}};

				// Find the data.
				this.run({"name": SOURCE}, `*`, {"auto sync": true});
				this.pick(SOURCE, null);
			}
		});
	};

	/*
	Run a search.

	@param {object} source the source data
	@param {object} data the data to find for
	@param {object} options the options to use
	*/
	async run(source, data, options) {
		const show = () => {
			return(new Promise((resolve, reject) => {
				Object.keys(this).includes(source[`name`]) ? resolve(
					this.find(source, data).then((results) => {
						return(this.display(source[`name`], results, (this[source[`name`]][`preview`]) ? (this[source[`name`]][`preview`]) : `name`));
					}))
				: reject();
			}));
		};

		show().then(() => {
			if (((typeof options).includes(`obj`) && options) ? options[`auto sync`] : false) {
				// Set the refresh function.
				let EXISTING_DATA = {};
				EXISTING_DATA[`item`] = this[source[`name`]][`selected`];
				EXISTING_DATA[`criteria`] = this[source[`name`]][`criteria`];

				this[source[`name`]][`scripts`][`refresh`] = () => {
					wait((this[`state`][`read/write`] ? this[`state`][`read/write`] >= 0 : true)).then(
						() => {
							if (this[source[`name`]][`selected`] == EXISTING_DATA[`item`] || EXISTING_DATA[`criteria`] == this[source[`name`]][`criteria`]) {
								show();
							} else if (this[source[`name`]][`scripts`][`background`][`refresh`]) {
								this[source[`name`]][`scripts`][`background`][`refresh`].cancel();
							};
						}
					);
				};

				this[source[`name`]][`scripts`][`background`][`refresh`] = new background(() => {this[source[`name`]][`scripts`][`refresh`]()});
			};
		}).catch((err) => {
			logging.error(err);
		});
	};

	/*
	Find the data.

	@param {object} source the source data
	@param {string} data the data to find for
	@param {object} the results, with their corresponding name as the key
	*/
	async find (source, data) {
		((((typeof source).includes(`str`) ? source.trim() : false) || Array.isArray(source)) && source)
			? source = {"name": source}
			: false;

		// Set the primary search criteria.
		if (data && data != `*`) {
			// Having data filled means an override.
			this[source[`name`]][`criteria`] = ((typeof data).includes(`str`)) ? data.trim() : data;
		} else if ((source[`element`]) ? source[`element`].value.trim() : false) {
			// There is an element to use.
			this[source[`name`]][`criteria`] = source[`element`].value.trim();
		} else if (this[source[`name`]][`elements`][`search box`] ? this[source[`name`]][`elements`][`search box`].length : false) {
			// No element defined, look for every box.
			(this[source[`name`]][`elements`][`search box`]).forEach((ELEMENT) => {
				this[source[`name`]][`criteria`] = (ELEMENT.type.includes(`num`) || ELEMENT.type.includes(`range`))
					? ((parseFloat(ELEMENT.value.trim()) != parseInt(ELEMENT.value.trim()))
						? parseFloat(ELEMENT.value.trim())
						: parseInt(ELEMENT.value.trim()))
					: ELEMENT.value.trim();

				this[source[`name`]][`criteria`] = (this[source[`name`]][`criteria`] != ``) ? this[source[`name`]][`criteria`] : null;
			})
		} else {
			this[source[`name`]][`criteria`] = null;
		};

		// Find.
		this[source[`name`]][`results`] = await ((this[source[`name`]][`criteria`] != null)
			? ((this[source[`name`]][`additional criteria`] ? this[source[`name`]][`additional criteria`].length : false)
				? global.search(source[`name`], this[source[`name`]][`criteria`], this[source[`name`]][`additional criteria`])
				: global.search(source[`name`], this[source[`name`]][`criteria`]))
			: global.read(source[`name`]));

		// Return the data.
		return (this[source[`name`]][`results`]);
	}

	/*
	Display the search results.

	@param {string} source the source data
	@param {object} data the data to display
	@param {string} title the field to display
	*/
	display(source, data, title) {
		if (source ? (Array.isArray(source) ? source.length : String(source)) : false) {
			source = (Array.isArray(source)) ? source.join(`,`) : String(source);

			// Get the data.
			data = (data && ((typeof data).includes(`obj`))) ? data : this[source][`results`];

			const gui_output = () => {
				// Prepare the elements we will need.
				if (this[source][`elements`][`results list`] ? this[source][`elements`][`results list`].length : false) {
					/*
					Add the selected state.
					*/
					const select = (element) => {
						if (element) {
							// Remove all active classes.
							(element).parentElement.querySelectorAll(`li:has(a)`).forEach((ELEMENT) => {
								ELEMENT.classList.remove(`active`);
							});

							// Add the active.
							element.classList.add(`active`);

							return (element);
						};
					};

					const design = () => {
						// Prepare the access keys.
						let ACCESS_KEYS = {"top": ["1", "2", "3", "4", "5", "6", "7", "8", "9"], "nav": ["<", ">"]};

						/*
						Add the access keys (shortcut).

						@param {string} name the name of the element
						@param {object} ELEMENT the element to add the access key to
						@param {object} state the current state of the element
						*/
						const shortcut = (name, element, state) => {
							let RESULT_INDEX = (Object.keys(data)).indexOf(name);

							if (RESULT_INDEX >= 0) {
								if (state.includes(`config`)) {
									((RESULT_INDEX < ACCESS_KEYS[`top`].length) && (RESULT_INDEX >= 0))
										? element.setAttribute(`accesskey`, ACCESS_KEYS[`top`][RESULT_INDEX])
										: false;

									return (element);
								} else if (state.includes(`execute`)) {
									let ELEMENT = {"selected": element};
									ELEMENT[`neighbors`] = (ELEMENT[`selected`].parentElement.parentElement).querySelectorAll(`a`);

									// Remove elements with accesskeys in nav.
									(ELEMENT[`neighbors`]).forEach((OTHER) => {
										(OTHER.getAttribute(`accesskey`) ? (ACCESS_KEYS[`nav`].includes(OTHER.getAttribute(`accesskey`))) : false)
											? OTHER.removeAttribute(`accesskey`)
											: false;
									})

									if ((RESULT_INDEX + 1 >= ACCESS_KEYS[`top`].length) && (RESULT_INDEX + 1 < ELEMENT[`neighbors`].length)) {
										ELEMENT[`neighbors`][RESULT_INDEX + 1].setAttribute(`accesskey`, ACCESS_KEYS[`nav`][1])
									}

									(RESULT_INDEX > ACCESS_KEYS[`top`].length)
										? (ELEMENT[`neighbors`])[RESULT_INDEX - 1].setAttribute(`accesskey`, ACCESS_KEYS[`nav`][0])
										: false;

									(RESULT_INDEX >= ACCESS_KEYS[`top`].length)
										? ELEMENT[`selected`].setAttribute(`accesskey`, `0`)
										: false;

									return (ELEMENT);
								}
							}
						}

						let ELEMENTS = [];

						(data ? Object.keys(data).length : false)
							? (Object.keys(data)).forEach((RESULT) => {
								let ELEMENTS_RESULT = {}
								ELEMENTS_RESULT[`container`] = document.createElement(`li`);
								ELEMENTS_RESULT[`title`] = document.createElement(`a`);

								// Add the classes.
								ELEMENTS_RESULT[`title`].classList.add(`waves-effect`);
								ELEMENTS_RESULT[`title`].textContent = String((title && data[RESULT][title]) ? data[RESULT][title] : RESULT);

								// Add the action.
								ELEMENTS_RESULT[`title`].addEventListener(`click`, () => {
									// Set the visual state.
									select(ELEMENTS_RESULT[`container`]);
									shortcut(RESULT, ELEMENTS_RESULT[`title`], `execute`);

									// Pick the data.
									this.pick(source, RESULT, data[RESULT]);
								});

								// Add the real linked data name temporarily.
								ELEMENTS_RESULT[`container`][`linked`] = RESULT;

								// Add the shortcut.
								ELEMENTS_RESULT[`title`] = shortcut(RESULT, ELEMENTS_RESULT[`title`], `config`);

								// Add the elements to the container.
								ELEMENTS_RESULT[`container`].appendChild(ELEMENTS_RESULT[`title`]);
								ELEMENTS.push(ELEMENTS_RESULT[`container`]);
							})
						: false;

						return (ELEMENTS);
					}

					let TEMPLATE = design();
					(this[source][`elements`][`results list`]).forEach((ELEMENT_TARGET) => {
						// Clear the target element.
						ELEMENT_TARGET.innerHTML = ``;
						(TEMPLATE.length)
							? TEMPLATE.forEach((ELEMENT) => {
								ELEMENT_TARGET.appendChild(ELEMENT);

								// Preselect the item.
								if (ELEMENT[`linked`] == nested.dictionary.get(this, [source, `selected`])) {
									select(ELEMENT);
								};
							})
							: this.pick(source, null);
					})
				};
			}

			/*
			Display the search results in the log.
			*/
			function log (data, title) {
				if (Object.keys(data).length) {
					let RESULT_STRING = ``;
					(Object.keys(data)).forEach((RESULT_KEY) => {
						RESULT_STRING += RESULT_KEY.concat(((title) ? data[RESULT_KEY][title] : false) ? `: `.concat(data[RESULT_KEY][title]) : ``, `\n`);
					})

					new logging(texts.localized(`search_found_heading`), RESULT_STRING, {"silent": true});
				} else {
					new logging(texts.localized(`search_notfound_heading`));
				}
			};

			log(data, title);
			gui_output();
		}
	};

	/*
	Pick a result from the search.

	@param {string} source the name of the source
	@param {object} item the item picked
	@param {string} details the details of the selected item
	*/
	pick(source, item, details) {
		// Fill in the details if it's missing when the item and source isn't.
		if (!details && (source && item)) {
			(Object.hasOwn(this[source][`results`], item))
			? details = this[source][`results`][item]
			: false;
		};

		const set = () => {
			this[source][`selected`] = item;

			// Set the background state.
			nested.dictionary.get(this, [source, `scripts`, `background`, `selected`])
				? this[source][`scripts`][`background`][`selected`].cancel()
				: false;
			if (!EMPTY) {
				this[source][`scripts`][`reader`] = wait((this[`state`][`read/write`] ? this[`state`][`read/write`] >= 0 : true)).then(
					() => {(this[source][`selected`] == item) ? gui_display() : false;}
				);

				// Reset the background.
				this[source][`scripts`][`background`][`selected`] = new background(() => {this[source][`scripts`][`reader`]});
			}
		}

		const gui_display = () => {
			const enable = () => {
				let DISABLED = EMPTY;
				let TARGETS = [];
				TARGETS = [...((this[source][`elements`][`container`] ? this[source][`elements`][`container`].length : false) ? this[source][`elements`][`container`] : []), ...((this[source][`elements`][`enable`] ? this[source][`elements`][`enable`].length : false) ? this[source][`elements`][`enable`] : [])];

				[`content`, `fields`].forEach((ELEMENTS) => {
					(this[source][`elements`][ELEMENTS] ? Object.keys(this[source][`elements`][ELEMENTS]).length : false)
					? Object.keys(this[source][`elements`][ELEMENTS]).forEach((SOURCE) => {
						(this[source][`elements`][ELEMENTS][SOURCE] ? this[source][`elements`][ELEMENTS][SOURCE].length : false)
						? TARGETS = [...TARGETS, ...this[source][`elements`][ELEMENTS][SOURCE]]
						: false;
					})
					: false;
				});

				(TARGETS.length)
					? (TARGETS).forEach((ELEMENT) => {
						ELEMENT.disabled = DISABLED;
					})
					: false;
			};

			const fill = () => {
				[`content`, `fields`].forEach((ELEMENTS) => {
					(this[source][`elements`][ELEMENTS] ? Object.keys(this[source][`elements`][ELEMENTS]).length : false)
					? Object.keys(this[source][`elements`][ELEMENTS]).forEach(async (SOURCE) => {
						if ((this[source][`elements`][ELEMENTS][SOURCE]) ? this[source][`elements`][ELEMENTS][SOURCE].length : false) {
							if (EMPTY) {
								this[source][`elements`][ELEMENTS][SOURCE].forEach((ELEMENT) => {
									if ((ELEMENT.nodeName.toLowerCase()).includes(`input`) || (ELEMENT.nodeName.toLowerCase()).includes(`textarea`) || (ELEMENT.nodeName.toLowerCase()).includes(`progress`)) {
										switch (ELEMENT.type) {
											case `checkbox`:
											case `radio`:
												ELEMENT.checked = false;
												break;
											default:
												ELEMENT.value = ``;
										};

										if ((ELEMENT.nodeName.toLowerCase()).includes(`input`) || (ELEMENT.nodeName.toLowerCase()).includes(`textarea`)) {
											// Check if the element has an event listener and remove it.
											(ELEMENT.func)
												? [`change`, `blur`].forEach((EVENT) => {
													ELEMENT.removeEventListener(EVENT, ELEMENT.func)
												})
												: false;
										}
									} else {
										ELEMENT.innerText = ``;
									};
								})
							} else {
								let DATA = {};
								DATA[`source`] = (SOURCE != `*`) ? SOURCE.split(`,`) : SOURCE;
								DATA[`target`] = (DATA[`source`] != `*`)
									? ((DATA[`source`][0] == `` || DATA[`source`][0] == `/`)
										? [...(DATA[`source`].slice(1)), ...[item]]
										: [...source.split(`,`), ...[item], ...(DATA[`source`])])
									: DATA[`source`];
								DATA[`value`] = (DATA[`source`] != `*`)
									? ((nested.dictionary.get(details, DATA[`source`]) != null)
										? nested.dictionary.get(details, DATA[`source`])
										: await global.read(DATA[`target`]))
									: ((typeof item).includes(`str`)
										? item.trim()
										: item);

								this[source][`elements`][ELEMENTS][SOURCE].forEach((ELEMENT) => {
									if ((ELEMENT.nodeName.toLowerCase()).includes(`input`) || (ELEMENT.nodeName.toLowerCase()).includes(`textarea`) || (ELEMENT.nodeName.toLowerCase()).includes(`progress`)) {

										switch (ELEMENT.type) {
											case `checkbox`:
											case `radio`:
												ELEMENT.checked = (DATA[`value`]);
												break;
											default:
												ELEMENT.value = DATA[`value`];
										};

										if ((DATA[`source`] != `*`) && (ELEMENT.nodeName.toLowerCase()).includes(`input`) || (ELEMENT.nodeName.toLowerCase()).includes(`textarea`)) {
											// Remove the existing function.
											(ELEMENT.func)
												? [`change`, `blur`].forEach((EVENT) => {
													ELEMENT.removeEventListener(EVENT, ELEMENT.func)
												})
												: false;

											// Add the new function.
											ELEMENT.func = () => {};
											switch (ELEMENT.type) {
												case `checkbox`:
												case `radio`:
													ELEMENT.func = () => {
														this[`state`][`read/write`] = -1;
														this[`state`][`last result`] = global.write(DATA[`target`], ELEMENT.checked, (ELEMENT[`data store location`] ? ELEMENT[`data store location`] : -1));

														this[`state`][`read/write`] = 0;
														return(this[`state`][`last result`]);
													};

													ELEMENT.checked = (DATA[`value`]);
													break;
												default:
													if ((typeof DATA[`value`]).includes(`obj`) && !Array.isArray(DATA[`value`])) {
														ELEMENT.value = JSON.stringify(DATA[`value`]);

														ELEMENT.func = () => {
															this[`state`][`read/write`] = -1;
															this[`state`][`last result`] = false;

															try {
																this[`state`][`last result`] = global.write(DATA[`target`], JSON.parse(ELEMENT.value.trim()), (ELEMENT[`data store location`] ? ELEMENT[`data store location`] : -1));
															} catch(err) {
																// The JSON isn't valid.
																logging.error(err.name, texts.localized(`error_msg_notJSON_syntax`), err.stack, false);
															};

															this[`state`][`read/write`] = 0;
															return(this[`state`][`last result`]);
														}
													} else {
														ELEMENT.value = DATA[`value`];

														ELEMENT.func = () => {
															this[`state`][`read/write`] = -1;

															ELEMENT.val = ((ELEMENT.type.includes(`num`) || ELEMENT.type.includes(`range`))
																? ((parseFloat(ELEMENT.value.trim()) != parseInt(ELEMENT.value.trim()))
																	? parseFloat(ELEMENT.value.trim())
																	: parseInt(ELEMENT.value.trim())
																)
																: ELEMENT.value.trim());

															this[`state`][`last result`] = global.write(DATA[`target`], ELEMENT.val, (ELEMENT[`data store location`] ? ELEMENT[`data store location`] : -1));
															this[`state`][`read/write`] = 0;

															delete ELEMENT.val;
															return (this[`state`][`last result`]);
														}
													};
											};

											(ELEMENT.nodeName.toLowerCase().includes(`textarea`))
												? ELEMENT.addEventListener(`blur`, ELEMENT.func)
												: false;

											ELEMENT.addEventListener(`change`, ELEMENT.func);
										}
									} else {
										ELEMENT.innerText = DATA[`value`];
									};
								})
							}

						}
					})
					: false;
				});
			}

			enable();
			fill();
		}


		const log = () => {
			(!EMPTY)
				? new logging (texts.localized(`search_selected_heading`, false, [item]), ((typeof details).includes(`obj`) && !Array.isArray(details)) ? JSON.stringify(details) : String(details), {"silent": true})
				: false;
		};

		let EMPTY = (item == null) ? true : ((details != null) ? !((typeof details).includes(`obj`) && !Array.isArray(details)) : true)
		set();
		log();
		gui_display();
	}
};

export { Search };
