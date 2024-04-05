/* Settings.js
	Build the interface for the settings
*/

// Import modules.
//import { windowman } from "../windowman.js";

async function build() {
	let secretariat = await import(
		chrome.runtime.getURL("scripts/secretariat.js")
	);
	let windowman = (
		await import(chrome.runtime.getURL("gui/scripts/windowman.js"))
	).default;

	let window = new windowman();
	window.sync();
	
	events(window);
};

/*
		Define the mapping of each button.
		*/
function events(window) {
	if (document.querySelector(`[data-action="filters,update"]`)) {
		document
			.querySelector(`[data-action="filters,update"]`)
			.addEventListener(`click`, async () => {
				let filters = new (
					await import(chrome.runtime.getURL(`scripts/filters.js`))
				).default();
				filters.update();
			});
	}

	if (document.querySelector(`[data-action="filters,add,one"]`)) {
		document
			.querySelector(`[data-action="filters,add,one"]`)
			.addEventListener(`click`, async () => {
				(async () => {
					// Import the filters module.
					let texts = (
						await import(chrome.runtime.getURL(`gui/scripts/read.js`))
					).default;
					let filters = new (
						await import(chrome.runtime.getURL(`scripts/filters.js`))
					).default();

					// Open text input window for adding a filter.
					let filter_source = prompt(
						texts.localized(`settings_filters_add_prompt`),
					);
					if (filter_source ? filter_source.trim() : false) {
						filters.update(filter_source.trim());
					}
				})();
			});
	}

	if (document.querySelector(`[data-action="storage,clear"]`)) {
		document
			.querySelector(`[data-action="storage,clear"]`)
			.addEventListener(`click`, async () => {
				let storage = (
					await import(chrome.runtime.getURL(`scripts/secretariat.js`))
				)["secretariat"];
				storage.forget(`sites`);
			});
	}
}

//main();
function load() {
	build();
	
	document.addEventListener("DOMContentLoaded", function () {
		M.AutoInit();
	});
}

load();
