/* filters.js
Manage filters.
*/

const secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));
const net = await import(chrome.runtime.getURL("scripts/net.js"));
const texts = (await import(chrome.runtime.getURL("gui/scripts/read.js"))).default;
const alerts = (await import(chrome.runtime.getURL("gui/scripts/alerts.js"))).default;

export default class filters {
	constructor() {
		this.all = async () => {
			// Import the updater.
			const secretariat = await import(
				chrome.runtime.getURL("scripts/secretariat.js")
			);

			return secretariat.read(`filters`, -1).then((filters) => {
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
			let filter = await secretariat.search(`filters`, -1, [`URL`]);

			// If there are filters, then filter the URL.
			return filter;
		})();

		return this.one;
	}

	/* Update all filters or just one.

	@param {string} URL the URL to update
	@return {boolean} the state
	*/
	async update(URL) {
		// Apparently, JS doesn't have a native queueing system, but it might best work here.
		class Queue {
			constructor() {
				this.elements = [];
			}

			enqueue(element) {
				this.elements.push(element);
			}

			dequeue() {
				return this.elements.shift();
			}

			isEmpty() {
				return this.elements.length <= 0;
			}
		}

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
			if (await secretariat.read(`filters`, -1)) {
				for (let FILTER_URL_INDEX = 0; FILTER_URL_INDEX < Object.keys(await secretariat.read(`filters`, -1)).length; FILTER_URL_INDEX++) {
					console.log(await secretariat.read([`settings`], 1));
					let FILTER_URL = Object.keys(await secretariat.read([`settings`, `filters`], 1))[FILTER_URL_INDEX];
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
				alerts.log(
					texts.localized(`settings_filters_update_status`, null, [filter_URL]),
				);

				// Create promise of downloading.
				let filter_download = net.download(filter_URL, `JSON`, false, true);
				filter_download
					.then(async function (result) {
						// Only work when the filter is valid.
						if (result) {
							// Write the filter to storage.
							secretariat.write(["filters", filter_URL], result, -1);
							alerts.log(texts.localized(`settings_filters_update_status_complete`,null,[filter_URL]));
                            
                            // Add the filter to the sync list.
                            if ((await secretariat.read(["settings", `filters`, filter_URL], 1)) == null) {
                                secretariat.write(["settings", `filters`, filter_URL], true, 1);
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
		this.all = await secretariat.read(`filters`, -1);

		return this.all;
	}

	/* Select the most appropriate filter based on a URL.

	@param {string} URL the URL to remove
	*/
	async remove(URL) {
		if (URL.includes(`://`)) {
			let CHOICE = await secretariat.forget(`filters`, URL);
			if (CHOICE) {
				console.log(await secretariat.read(null, -1), URL);
				if (await secretariat.read([`settings`, `filters`, URL], 1)) {
					console.log(await secretariat.read([`settings`, `filters`], 1));
					let DATA_GROUP = await secretariat.read([`settings`, `filters`], 1);
					delete DATA_GROUP[URL];
					await secretariat.write([`settings`, `filters`], DATA_GROUP, 1);
				};
			}

			return CHOICE;
		} else {
			// Inform the user of the download being unnecessary.
			alerts.warn(texts.localized(`settings_filters_removal_stop`));
			return false;
		}
		
	}
}
