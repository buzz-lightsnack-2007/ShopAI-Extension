/*
	hello.js
	Build the interface for the welcome and configuration page. 
*/

// Import modules.
import {global} from "/scripts/secretariat.js";
import Page from "/scripts/pages/page.js";
import texts from "/scripts/mapping/read.js";
import nested from "/scripts/utils/nested.js";

class Page_MiniConfig extends Page {
	constructor () {
		super({"headers": {"CSS": [`/styles/hello.css`]}});
		this.#set();
		this.#content();
		this.#navigate();
	};

	/*
	Set the default options. 
	*/
	#set() {
		global.read([`init`]).then((STATE) => {
			if (!STATE) {
				this.window.tabs.open(`OOBE`, `OOBE_Hello`);
				
				// Update the storage to mark that the OOBE page has been viewed. 
				global.write([`init`], true, 1, {"silent": true});
			} else {
				global.read([`settings`,`analysis`,`api`,`key`]).then((STATE) => {
					(!STATE) ? this.window.tabs.open(`OOBE`, `OOBE_APISetup`) : false;
				});
			};
		});

	}

	/*
	Build the additional content for the page. 
	*/
	#content() {
		const navigation = () => {
			Object.keys(this.window.tabs[`OOBE`][`elements`][`tabs`]).forEach((TAB, INDEX) => {
				if (this.window.tabs[`OOBE`][`elements`][`tabs`][TAB][`body`] && INDEX < Object.keys(this.window.tabs[`OOBE`][`elements`][`tabs`]).length - 1) {
					let ELEMENT = document.createElement(`label`);

					// Add the relevant properties. 
					ELEMENT.id = `tip`;
					ELEMENT.textContent = texts.localized(`OOBE_tip_next`);

					// Inject the element to the end. 
					this.window.tabs[`OOBE`][`elements`][`tabs`][TAB][`body`].appendChild(ELEMENT);
				}
			})
		}

		const text_content = () => {
			// Set the headline.
			const step1_headline = () => {
				if (this.window.tabs[`OOBE`][`elements`][`tabs`][`OOBE_Hello`][`body`].querySelector(`[for="GUI_welcome_headline"]`)) {
					this.window.tabs[`OOBE`][`elements`][`tabs`][`OOBE_Hello`][`body`].querySelector(`[for="GUI_welcome_headline"]`).textContent = texts.localized(`OOBE_welcome_headline_`.concat(String(Math.floor(Math.random() * 2) + 1)));
				};
			};

			/*
			Generate the cards for the steps. 

			@param {String} name The name of the card.
			@param {Element} parent The parent element.
			*/
			function generateCards(name) {
				let ELEMENTS = {};

				// The element types used during generation. 
				const ELEMENT_TYPES = {
					"container": {
						"container": "section",
						"image": "figure",
						"content": "figcaption"
					},
					"image": "img",
					"content": "p"
				};

				for (let STEP_NUMBER = 1; texts.localized(name.concat(`_Step${STEP_NUMBER}`)); STEP_NUMBER++) {
					function set_elements(target, template) {
						Object.keys(template).forEach((PART) => {
							((typeof template[PART]).includes(`object`)) 
								? target[PART] = set_elements({}, template[PART])
								: target[PART] = document.createElement(template[PART]);
						});

						return (target);
					};

					const set_classes = () => {
						Object.keys(ELEMENTS[STEP_NUMBER][`container`]).forEach((PART) => {
							ELEMENTS[STEP_NUMBER][`container`][PART].classList.add(`card`.concat(([`container`].includes(PART)) ? `` : `-`.concat(PART)));
						});
					}

					const set_contents = () => {
						ELEMENTS[STEP_NUMBER][`content`].textContent = texts.localized(name.concat(`_Step${STEP_NUMBER}`));
						ELEMENTS[STEP_NUMBER][`image`].src = `/media/screenshots/`.concat(name, `_Step${STEP_NUMBER}.png`);
					};

					const set_arrangement = () => {
						// Add elements to their parent. 
						[`image`, `content`].forEach((PART) => {
							ELEMENTS[STEP_NUMBER][`container`][PART].appendChild(ELEMENTS[STEP_NUMBER][PART]);
							ELEMENTS[STEP_NUMBER][`container`][`container`].appendChild(ELEMENTS[STEP_NUMBER][`container`][PART]);
						});
					}

					ELEMENTS[STEP_NUMBER] = set_elements({}, ELEMENT_TYPES);
					set_classes();
					set_contents();
					set_arrangement();
				};

				return (ELEMENTS);
			}

			let step3_cards = () => {
				let NAME = "OOBE_quickstart_tip";
				let ELEMENTS = generateCards(NAME);

				document.querySelectorAll(`[card-id="OOBE_quickstart_tip"]`).forEach((ELEMENT) => {
					Object.entries(ELEMENTS).forEach(([STEP, ELEMENTS]) => {
						ELEMENT.appendChild(ELEMENTS[`container`][`container`]);
					});
				});

				// Merge the cards. 
				this.window.elements.cards = (this.window.elements.cards) ? this.window.elements.cards : {};
				this.window.elements.cards[NAME] = ELEMENTS;
			};
			
			step1_headline();
			step3_cards();
		};

		navigation();
		text_content();
	};

	/*
	Assist with navigation. 
	*/
	#navigate() {
		this.navigation = (this.navigation) ? this.navigation : {};
		this.navigation.selection = this.window.tabs[`OOBE`].selected;

		Object.keys(this.window.tabs[`OOBE`][`elements`][`tabs`]).forEach((TAB, INDEX) => {
			this.window.tabs[`OOBE`][`elements`][`tabs`][TAB][`header`].event = () => {
				Object.keys(this.window.tabs[`OOBE`][`elements`][`tabs`]).forEach((TAB) => {
					this.window.tabs[`OOBE`][`elements`][`tabs`][TAB][`header`].removeAttribute(`accesskey`);
				});

				if (INDEX < Object.keys(this.window.tabs[`OOBE`][`elements`][`tabs`]).length - 1) {
					this.window.tabs[`OOBE`][`elements`][`tabs`][Object.keys(this.window.tabs[`OOBE`][`elements`][`tabs`])[INDEX + 1]][`header`].setAttribute(`accesskey`, `n`);
				}
				if (INDEX > 0) {
					this.window.tabs[`OOBE`][`elements`][`tabs`][Object.keys(this.window.tabs[`OOBE`][`elements`][`tabs`])[INDEX - 1]][`header`].setAttribute(`accesskey`, `b`);
				}
			};

			this.window.tabs[`OOBE`][`elements`][`tabs`][TAB][`header`].addEventListener(`click`, () => {this.window.tabs[`OOBE`][`elements`][`tabs`][TAB][`header`].event()});
		});
		
	}
}

new Page_MiniConfig();