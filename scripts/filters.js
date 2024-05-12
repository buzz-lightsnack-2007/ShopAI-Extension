/* filters.js
Manage filters.
*/

import {global} from "./secretariat.js";
import net from "/scripts/utils/net.js";
import texts from "/scripts/mapping/read.js";
import {URLs} from "/scripts/utils/URLs.js";
import {Queue} from "/scripts/utils/common.js";
import logging from "/scripts/logging.js"
// const logging = (await import(chrome.runtime.getURL("/scripts/logging.js"))).default;

export default class filters {
	constructor() {
		this.refresh();
	}

	/* 
	Get all filters. 
	*/
	async refresh() {
		this.all = await global.read(`filters`);
	};

	/* Select the most appropriate filter based on a URL.

	@param {string} URL the current URL
	*/
	async select(URL) {
		if (!URL) {
			try {
				URL = window.location.href;
			} catch(err) {}
		};

		if (URL) {
			let SELECTED = await global.search(`filters`, URL, `URL`, 0.5, {"cloud": -1});
			
			if ((SELECTED && SELECTED != null && (typeof SELECTED).includes(`obj`)) ? (Object.keys(SELECTED)).length : false) {
				this.one = (Object.entries(SELECTED))[0][1];
				return (this.one);
			};
		}
	};

	/* Update all filters or just one.

	@param {string} URL the URL to update
	@return {boolean} the state
	*/
	async update(location) {
		// Create a queue of the filters.
		let filters = new Queue();

		if (location && location != `*`) {
			let LOCATIONS = [];
			(Array.isArray(location)) 
				? location.forEach((LOCATION) => {
					URLs.test(LOCATION) ? LOCATIONS.push(LOCATION) : false;
				})
				: (URLs.test(location)) ? LOCATIONS.push(location) : false;
			
			(LOCATIONS.length)
				? LOCATIONS.forEach((LOCATION) => {
					filters.enqueue(LOCATION);
				})
				: false;
		} else {
			// Add every item to the queue based on what was loaded first.
			let FILTERS_ALL = await global.read(["settings", `filters`]);
			if (((typeof (FILTERS_ALL)).includes(`obj`) && !Array.isArray(FILTERS_ALL)) ? Object.keys(FILTERS_ALL).length > 0 : false) {
				for (let FILTER_URL_INDEX = 0; FILTER_URL_INDEX < Object.keys(FILTERS_ALL).length; FILTER_URL_INDEX++) {
					let FILTER_URL = (Object.keys(FILTERS_ALL, 1))[FILTER_URL_INDEX];
					if (FILTER_URL.includes(`://`)) {
						filters.enqueue(FILTER_URL);
					}
				}
			}
		}

		if (!filters.isEmpty()) {
			while (!filters.isEmpty()) {
				let filter_URL = filters.dequeue();

				// Inform the user of download state.
				new logging (texts.localized(`settings_filters_update_status`), filter_URL);

				// Create promise of downloading.
				let filter_download = net.download(filter_URL, `JSON`, false, true);
				filter_download
					.then(async function (result) {
						// Only work when the filter is valid.
						if (result) {
							// Write the filter to storage.
							await global.write(["filters", filter_URL], result, -1, {"silent": true});
							
							// Add the filter to the sync list.
							if ((await global.read(["settings", `filters`])) ? !((Object.keys(await global.read(["settings", `filters`]))).includes(filter_URL)) : true) {
								global.write(["settings", `filters`, filter_URL], true, 1, {"silent": true});
							};

							// Notify that the update is completed. 
							new logging(texts.localized(`settings_filters_update_status_complete`),filter_URL);
						}
					})
					.catch((error) => {
						// Inform the user of the download failure.
						logging.error(error.name, texts.localized(`settings_filters_update_status_failure`, null, [error.name, filter_URL]), error.stack);
					});
			}
		} else {
			// Inform the user of the download being unnecessary.
			logging.warn(texts.localized(`settings_filters_update_stop`));
		}

		// Regardless of the download result, update will also mean setting the filters object to whatever is in storage.
		this.all = await global.read(`filters`, -1);

		return this.all;
	}

	/* Select the most appropriate filter based on a URL.

	@param {string} URL the URL to remove
	*/
	async remove(URL) {
		if (URL.includes(`://`)) {
			return((await global.forget([`filters`, URL], -1, false)) ? global.forget([`settings`, `filters`, URL], 1, true) : false);
		} else {
			// Inform the user of the removal being unnecessary.
			logging.warn(texts.localized(`settings_filters_removal_stop`));
			return false;
		}
		
	}
}
