/* filters.js
Manage filters.
*/

import {read, write, forget, search} from "./secretariat.js";
import net from "./net.js";
import texts from "/scripts/strings/read.js";
import {Queue} from "./common.js";
import logging from "/scripts/logging.js"
// const logging = (await import(chrome.runtime.getURL("/scripts/logging.js"))).default;

export default class filters {
	constructor() {
		this.all = async () => {
			return read(`filters`, -1).then((filters) => {
				return filters;
			});
		};
	}

	/* Select the most appropriate filter based on a URL.

	@param {string} URL the current URL
	*/
	async select(URL = window.location.href) {
		let SELECTED = await (async () => {
			// Get the filters.
			let filter = await search(`filters`, URL, `URL`, false, {"cloud": -1});

			// If there are filters, then filter the URL.
			return filter;
		})();

		if ((SELECTED && SELECTED != null && (typeof SELECTED).includes(`obj`)) ? (Object.keys(SELECTED)).length > 0 : false) {
			this.one = (Object.entries(SELECTED))[0][1];
			return (this.one);
		};
	};

	/* Update all filters or just one.

	@param {string} URL the URL to update
	@return {boolean} the state
	*/
	async update(URL) {
		// Create a queue of the filters.
		let filters = new Queue();

		if (URL) {
			// Check if the URL is in a valid protocol
			if (URL.includes(`://`)) {
				// Append that to the queue.
				filters.enqueue(URL);
			}
		} else {
			// Add every item to the queue based on what was loaded first.
			let FILTERS_ALL = await read(["settings", `filters`]);
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
				new logging (texts.localized(`settings_filters_update_status`, null, [filter_URL]));

				// Create promise of downloading.
				let filter_download = net.download(filter_URL, `JSON`, false, true);
				filter_download
					.then(async function (result) {
						// Only work when the filter is valid.
						if (result) {
							// Write the filter to storage.
							write(["filters", filter_URL], result, -1);
							logging.log(texts.localized(`settings_filters_update_status_complete`,null,[filter_URL]));
                            
							// Add the filter to the sync list.
							if ((await read(["settings", `filters`])) ? !((Object.keys(await read(["settings", `filters`]))).includes(filter_URL)) : true) {
								write(["settings", `filters`, filter_URL], true, 1);
							}
						}
					})
					.catch(async function(error) {
						// Inform the user of the download failure.
						logging.error(error.name, texts.localized(`settings_filters_update_status_failure`, null, [error.name, filter_URL]), error.stack);
					});
			}
		} else {
			// Inform the user of the download being unnecessary.
			logging.warn(texts.localized(`settings_filters_update_stop`));
		}

		// Regardless of the download result, update will also mean setting the filters object to whatever is in storage.
		this.all = await read(`filters`, -1);

		return this.all;
	}

	/* Select the most appropriate filter based on a URL.

	@param {string} URL the URL to remove
	*/
	async remove(URL) {
		if (URL.includes(`://`)) {
			return((await forget([`filters`, URL], -1, false)) ? await forget([`settings`, `filters`, URL], 1, true) : false);
		} else {
			// Inform the user of the removal being unnecessary.
			logging.warn(texts.localized(`settings_filters_removal_stop`));
			return false;
		}
		
	}
}
