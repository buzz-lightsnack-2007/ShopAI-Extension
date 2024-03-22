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

	function pref_data_set(database) {
		pref_data = database[prefname];
	};

	// Retrieve the data.
	if (cloud) {
		chrome.storage.sync.get(prefname, (items) => {
			pref_data_set(items);
			});
	} else {
		chrome.storage.local.get(prefname, (items) => {
			pref_data_set(items);
			});
	}

	return(pref_data);
}

export function specifics(WHERE, domain = window.location.href) {
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
				(Object.keys(pref_data)).forEach((product_URL) => {
					// Get the first matching
					if ((domain.trim()).includes(product_URL)) {
						// Do not modify the data
						result = pref_data[product_URL];
					};
				});
			};
			break;
	};

	// Return the result.
	return(result);
}

export function write(prefname, data) {
	/* Write the data on the selected prefname.

	Parameters:
		prefname: the preference name
		data: the new data to be written
	*/


}

export function amend(WHERE, SITE, DATA) {
	/* Update the rules.

	Parameters:
		WHERE: the data set to update
		SITE: RegEx pattern of the website or the domain
		DATA: the data in JSON
	Returns: (boolean) the update status
	*/


}

export function forget(domain) {
	/* Dangerous: Resets all data or a domain's data.

	Parameters:
		domain: the external source of the filter
	Returns: the user's confirmation
	*/

	let forget_action = false;

	(async () => {
		// Import alerts module.
		let alerts = await import(chrome.runtime.getURL(`gui/scripts/alerts.js`));

		// Confirm the action.
		let forget_action = alerts.confirm_action();

		if (forget_action) {
			if (domain) {

			} else {
					// Clear the data storage.
					chrome.storage.local.clear();
					chrome.storage.sync.clear();
			};
		};
	})();

	return (forget_action);
};
