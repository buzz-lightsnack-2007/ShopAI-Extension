/* filters.js
Manage filters.
*/

import {read, write, forget} from "./secretariat.js";
import {download} from "./net.js";
import texts from "/gui/scripts/read.js";
import {Queue} from "./common.js";
import alerts from "/gui/scripts/alerts.js"
// const alerts = (await import(chrome.runtime.getURL("gui/scripts/alerts.js"))).default;

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
		this.one = await (async () => {
			// Get the filters.
			let filter = await search(`filters`, -1, [`URL`]);

			// If there are filters, then filter the URL.
			return filter;
		})();

		return (this.one);
	}

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
				new alerts (texts.localized(`settings_filters_update_status`, null, [filter_URL]));

				// Create promise of downloading.
				let filter_download = download(filter_URL, `JSON`, false, true);
				filter_download
					.then(async function (result) {
						// Only work when the filter is valid.
						if (result) {
							// Write the filter to storage.
							write(["filters", filter_URL], result, -1);
							alerts.log(texts.localized(`settings_filters_update_status_complete`,null,[filter_URL]));
                            
							// Add the filter to the sync list.
							if ((await read(["settings", `filters`])) ? !((Object.keys(await read(["settings", `filters`]))).includes(filter_URL)) : true) {
								write(["settings", `filters`, filter_URL], true, 1);
							}
						}
					})
					.catch(async function(error) {
						// Inform the user of the download failure.
						alerts.error(error.name, texts.localized(`settings_filters_update_status_failure`, null, [error.name, filter_URL]), error.stack);
					});
			}
		} else {
			// Inform the user of the download being unnecessary.
			alerts.warn(texts.localized(`settings_filters_update_stop`));
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
			await forget([`filters`, URL], -1, false) ? await forget([`settings`, `filters`, URL], 1, true) : false;
		} else {
			// Inform the user of the removal being unnecessary.
			alerts.warn(texts.localized(`settings_filters_removal_stop`));
			return false;
		}
		
	}
}
