/* Settings.js
	Build the interface for the settings
*/

// Import modules.
import texts from './read.JS';
import {windowman} from './windowman.JS';
let secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));

// Import configuration file.
// const config = chrome.runtime.getURL('gui/layouts/settings.json');

let pref_pane = 0;


function start() {
	windowman.prepare();
}

/* Generate the appropriate strings.  */
function say() {
	windowman.fill();
}

		/* Add the UI design. */
		//function design(element) {
			// Set the event of the window.
			/*function controls() {
				document.getElementById(element[`titlebar`][`controls`][`Close`][`ID`]).onclick = function(){element.terminate(false)};
			}

			function menu() {
				element.inject(null, 'navbar', element[`content`], `menu`, null, null, {'role': 'tablist'})
			}

			/* Add the content. */
			/*function content() {
				let page_layout = jsonData;

				windowman_builder.tabs(Object.keys(page_layout));

				function tabs(tab_names, parent_element) {
					(tab_names).forEach((tab_name) => {
						// Create the elements for each tab content.
						let inserted_element = element.inject(texts.localized(`term_`.concat(tab_name)), texts.localized(`term_`.concat(tab_name)), element[`content`], `section`, null, null, {'role': `tabpanel`});

						// Create the menu elements.
						element.inject(texts.localized(`term_`.concat(tab_name)), texts.localized(`term_`.concat(tab_name)), element[`content`][`navbar`], `button`, null, null, {'aria-controls': inserted_element});

					});
				}

				/*
				Add each item for each preference page, but do not fill in their default preferences.

				@param {dictionary} layout the layout
				*//*
				function eachItem(layout) {
					(layout).forEach((tab) => {
						// let inserted_element = element.inject(texts.localized(`term_`.concat(tab_name)), texts.localized(`term_`.concat(tab_name)), element[`content`], `section`, null, null, {'role': `tabpanel`});
						let current_tab = element[`content`][`navbar`][texts.localized(`term_`.concat(tab_name))];

						(Object.keys(current_tab)).forEach((element_item) => {

						})

						// element.update(element[`content`][`navbar`][texts.localized(`term_`.concat(tab_name))], texts.localized(`term_`.concat(tab_name)));
						// Create the elements for each tab content.
						element.inject(texts.localized(`term_`.concat(tab)), texts.localized(`term_`.concat(tab_name)), element[`content`], `section`, null, null, {'role': `tabpanel`});

						// Create the menu elements.
						element.inject(texts.localized(`term_`.concat(tab_name)), texts.localized(`term_`.concat(tab_name)), element[`content`][`navbar`], `button`, null, null, {'aria-controls': inserted_element});

					});
				}


				tabs(Object.keys(page_layout));
			}

			function action_buttons() {
				 element.inject(`action_buttons`, `footer`, element[`content`], `footer`, [`field-row`], null, {'style': 'justify-content: flex-end'});

				 let button_names = ['apply', 'cancel'];

				 (button_names).forEach((button_name) => {
						// Create the elements for each tab content.
						element.inject(null, texts.localized(`term_`.concat(button_name)), element[`content`][`footer`], `button`);
				 });
			}

			controls();
			menu();
			content();
			action_buttons();
		}

		/* Populate the strings on the page. */
		/*function say(element) {
			document.title = texts.localized(`GUI_title_preferences`);
			element.update(element[`titlebar`][`title`], texts.localized(`GUI_title_preferences`));


			function content() {
				fetch(config)
					.then((response) => response.json())
					.then((jsonData) => {
						let page_layout = jsonData;

						function tabs(tab_names) {
							(tab_names).forEach((tab_name) => {
								// Create the elements for each tab content.
								element.update(element[`content`][`navbar`][texts.localized(`term_`.concat(tab_name))], texts.localized(`term_`.concat(tab_name)));
							});
						}

						tabs(Object.keys(page_layout));
					})
					.catch((error) => {
						console.error(error);
					});
			}

			// Controls
			/*
			let tab_names = ['preferences', 'filters', 'about'];
			(tab_names).forEach((tab_name) => {
					 element.update(element[`content`][`navbar`][texts.localized(`term_`.concat(tab_name))], texts.localized(`term_`.concat(tab_name)));
			});

			function action_buttons() {
				 let button_names = ['apply', 'cancel'];

				 (button_names).forEach((button_name) => {
					 // Create the elements for each tab content.
					 element.update(element[`content`][`footer`][texts.localized(`term_`.concat(button_name))], texts.localized(`term_`.concat(button_name)));
				 });
			}

			content();
			action_buttons();

		}

		*/

		/*
		Arrange the interface.
		*/
		function arrange() {
			async function click() {
				let last_opened = (await Promise.all([secretariat.read([`view`, window.location.href], 1)]))[0];
				if (!last_opened) {last_opened = 'settings'};

				document.querySelector(`[role="tab"][for="${last_opened}"]`).click();
			}



			// click!
			// document.querySelector(`menu button[role="tab"][aria-controls="${last_opened}"]`).click();
			click();
		}

		/*
		Define the mapping of each button.
		*/
		function events() {
			windowman.events();
		};

		function main() {
			let tab = start();
			say();
			events();

			arrange();


			/*arrange();
			events();*/
		}

		main();
