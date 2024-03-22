/* secretriat.js
Manage the local cache.
*/

export function read(prefname, cloud = false) {
	/* Read all storeed data in the browser cache.

	Parameters:
		prefname: (string) the preference name
		cloud: (bool) determine cloud reading, which is otherwise disabled
	Returns: (Object) the preferences
	*/

	// Initialize the selected pref data.
	let pref_data;

	if (prefname) {
		// Retrieve the data.
		if (cloud) {
			chrome.storage.sync.get(null, (database) => {pref_data = database[prefname]});
		} else {
			chrome.storage.local.get(null, (database) => {pref_data = database[prefname];});
		};
	} else {
		// You can get everything if you'd like.
		if (cloud) {
			chrome.storage.sync.get(null, (database) => {pref_data = database});
		} else {
			chrome.storage.local.get(null, (database) => {pref_data = database;});
		};
	};


	return(pref_data);
}

export function specifics(WHERE, domain) {
	/* List the matching rule or memory for a particular domain.

	Parameters:
		WHERE: the data source
		domain: the website to check, which --- by default --- is the current website
	Returns: (dictionary) the rules
	*/

	let result;

	let pref_data = read(WHERE);
	// Read the filters.
	switch (domain) {
		case `filters`:
			let filters = pref_data;
			if (filters) {
				// Must only run when there stored value.
				if (domain.trim()) {
					// Loop through each filter
					(Object.keys(filters)).forEach((article) => {
						// Set the section in focus
						let section = filters[article];
						let qualified = false;

						// Determine validity
						if (section) {
							// The filter must have a matching URL
							if (section[`URL`]) {
								// Now it's time to test it.
								qualified = (new RegExp(section[`URL`])).test(domain);
								if (qualified && section[`filters`]) {
									// Read that out.
									result = section;
								};
							};
						};
					});

				} else {
					// Get everything as instructed.
					result = filters;
				}
			};
			break;
		default:
			// In the default mode, the keys refer to the product itself
			if (pref_data) {
				if (domain) {
					// Extract a data only when a website URL is specified.
					(Object.keys(pref_data)).forEach((product_URL) => {
						// Get the first matching
						if ((domain.trim()).includes(product_URL)) {
							// Do not modify the data
							result = pref_data[product_URL];
						};
					});
				} else {
					result = pref_data;
				}
			};
			break;
	};

	// Return the result.
	return(result);
}

export function write(PREFERENCE, SUBPREFERENCE, DATA, CLOUD = false) {
	/* Write the data on the selected prefname.

	Parameters:
		PREFERENCE: the preference name
		DATA: the new data to be written
		SUBPREFERENCE: the intermediate data
		CLOUD: store in the cloud, which isn't recommended
	*/

	let DATA_INJECTED = DATA;

	if (SUBPREFERENCE) {
		// Collect the existing preferenc's data.
		let DATA_ALL = read(PREFERENCE);

		// handle empty collected data.
		if (!DATA_ALL) {DATA_ALL = {};};

		// Add the subpreference.
		DATA_ALL[SUBPREFERENCE] = DATA;
		DATA_INJECTED = DATA_ALL;

	} else {
		DATA_INJECTED = DATA;
	};

	if (CLOUD) {
		chrome.storage.sync.set({[`${PREFERENCE}`]: DATA_INJECTED});
	} else {
		chrome.storage.local.set({[`${PREFERENCE}`]: DATA_INJECTED});
	};
}

export function forget(preference, subpreference, CLOUD = false) {
	/* Dangerous: Resets all data or a domain's data.

	Parameters:
		prefernece: the preference name to delete
		subpreference: the subpreference name to delete
		CLOUD: the storage of the data
	Returns: the user's confirmation
	*/

	let forget_action = false;

	(async () => {
		// Import alerts module.
		let alerts = await import(chrome.runtime.getURL(`gui/scripts/alerts.js`));

		// Confirm the action.
		let forget_action = alerts.confirm_action();

		if (forget_action) {
			if (preference) {
				if (subpreference) {
					// Get the data.
					data = read(preference, CLOUD);

					// Should only run when existent
					if (data[subpreference]) {
						delete data[subpreference];
						write(preference, subpreference, data, CLOUD);
					}
				} else {
					// Remove that particular data.
					chrome.storage.local.get(null, (data) => {
						delete data[preference];

						chrome.storage.local.set(data, (result) => {});
					});
				};
			} else {
					// Clear the data storage.
					chrome.storage.local.clear();
					chrome.storage.sync.clear();
			};
		};
	})();

	return (forget_action);
}
