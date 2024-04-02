/* filters.js
Manage filters.
*/

export default class filters {
	constructor() {
		this.all = {};
	}

	/* Select the most appropriate filter based on a URL.

	@param {string} URL the current URL
	*/
	static async select(URL = window.location.href) {
		this.one = await (async () => {
			// Import the secretariat.
			const secretariat = await import(
				chrome.runtime.getURL("scripts/secretariat.js")
			);

			// Get the filters.
			let filter = (await secretariat.read(`filters`, -1, {"field": "URL", "test value": URL}));

			// If there are filters, then filter the URL.
			return (filter);
		})();

		return (this.one);
	}

	/* Update all filters or just one.

	@param {string} URL the URL to update
	@return {boolean} the state
	*/
	static update(URL) {
		this.all = (async () => {
			// Import the updater.
			const secretariat = await import(
				chrome.runtime.getURL("scripts/secretariat.js")
			);
			const net = await import(chrome.runtime.getURL("scripts/net.js"));
			const texts = (await import(chrome.runtime.getURL("gui/scripts/read.js")))
				.default;
			const alerts = (
				await import(chrome.runtime.getURL("gui/scripts/alerts.js"))
			).default;

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
				if ((await Promise.all([secretariat.read(`filters`, -1)]))[0]) {
					Object.keys(
						(await Promise.all([secretariat.read(`filters`, -1)]))[0],
					).every((filter_URL) => {
						if (filter_URL.includes(`://`)) {
							filters.enqueue(filter_URL);
						}
					});
				}
			}

			if (!filters.isEmpty()) {
				while (!filters.isEmpty()) {
					let filter_URL = filters.dequeue();

					// Inform the user of download state.
					alerts.log(
						texts.localized(`settings_filters_update_status`, null, [
							filter_URL,
						]),
					);

					// Create promise of downloading.
					let filter_download = net.download(filter_URL);
					filter_download
						.then((result) => {
							// Only work when the filter is valid.
							if (result) {
								// Write the filter to storage.
								secretariat.write(["filters", filter_URL], result, -1);
								console.log(
									texts.localized(
										`settings_filters_update_status_complete`,
										null,
										[filter_URL],
									),
								);
							}
							
						})
						.catch((error) => {
							// Inform the user of the download failure.
							console.log(
								texts.localized(
									`settings_filters_update_status_failure`,
									null,
									[error, filter_URL],
								),
							);
						});
				}
			} else {
				// Inform the user of the download being unnecessary.
				alerts.warn(texts.localized(`settings_filters_update_stop`));
			}

			// Regardless of the download result, update will also mean setting the filters object to whatever is in storage. 
			return(secretariat.read(`filters`, -1).then((filters) => {
				return(filters)
			}));
		})();
	}
}
