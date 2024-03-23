/* secretriat.js
Manage the local cache.
*/

/* Read all storeed data in the browser cache.

@param {string} prefname the preference name
@param {int} cloud determine cloud reading, which is otherwise set to automatic (0)
@return {dictionary} the preferences
*/
export function read(prefname, cloud = 0) {

	// Initialize the selected pref data.
	let pref_data;

	if (prefname) {
		// Retrieve the data.
		let data_readings = {'sync': null, 'local': null}
		chrome.storage.sync.get(null, (database) => {data_readings[`sync`] = database[prefname]});
		chrome.storage.sync.get(null, (database) => {data_readings[`local`] = database[prefname]});

		if ((cloud == 0 && data_readings[`sync`]) || cloud == 1) {
			pref_data = data_readings[`sync`];
		} else {
			pref_data = data_readings[`local`];
		}
	} else {
		// You can get everything if you'd like.
		if (cloud > 0) {
			chrome.storage.sync.get(null, (database) => {pref_data = database});
		} else {
			chrome.storage.local.get(null, (database) => {pref_data = database;});
		};
	};


	return(pref_data);
}

/* List the matching rule or memory for a particular domain.

@param {string} WHERE the data source
@param {string} the data to check
@return {dictionary} the rules
*/
export function specifics(WHERE, domain) {

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

/* Write the data on the selected prefname.

@param {string} PREFERENCE the preference name
@param {string} SUBPREFERENCE the subpreference
@param {object} DATA the new data to be written
@param {int} CLOUD store in the cloud; otherwise set to automatic
*/
export function write(PREFERENCE, SUBPREFERENCE, DATA, CLOUD = 0) {

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

	// If CLOUD is set to 0, it should automatically determine where the previous source of data was taken from.
	if ((CLOUD == 1) || (CLOUD == 0 && read(PREFERENCE, 1))) {
		chrome.storage.sync.set({[`${PREFERENCE}`]: DATA_INJECTED});
	} else {
		chrome.storage.local.set({[`${PREFERENCE}`]: DATA_INJECTED});
	};
}

/* Dangerous: Resets all data or a domain's data.

@param {string} preference the preference name to delete
@param {string} subpreference the subpreference name to delete
@param {int} CLOUD the storage of the data
@return {boolean} the user's confirmation
*/
export function forget(preference, subpreference, CLOUD = 0) {

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
					if (CLOUD <= 0) {
						chrome.storage.local.get(null, (data) => {
							delete data[preference];

							chrome.storage.local.set(data, (result) => {});
						});
					};
					if (CLOUD >= 0) {
						chrome.storage.sync.get(null, (data) => {
							delete data[preference];

							chrome.storage.sync.set(data, (result) => {});
						});
					};
				};
			} else {
					// Clear the data storage.
					if (CLOUD >= 0) {chrome.storage.sync.clear();};
					if (CLOUD <= 0) {chrome.storage.local.clear();};
			};
		};
	})();

	return (forget_action);
}

/* Initialize the storage.

@param {dictionary} data this build's managed data
*/
export function init(data) {

	let PREFERENCES_ALL = {};
	PREFERENCES_ALL[`build`] = data;

	// Read all data.
	chrome.storage.managed.get(null, function(DATA_MANAGED){
		PREFERENCES_ALL[`managed`] = DATA_MANAGED;
	});

	chrome.storage.local.get(null, function(DATA_LOCAL){
		PREFERENCES_ALL[`local`] = DATA_LOCAL;
	});

	chrome.storage.sync.get(null, function(DATA_SYNC){
		PREFERENCES_ALL[`sync`] = DATA_SYNC;
	});

	// Merge data.
	// Managed > Synchronized > Imported > Local

	if (PREFERENCES_ALL[`managed`]) {
		(Object.keys(PREFERENCES_ALL[`managed`])).forEach((item) => {
			let PREFERENCE = {'name': item, 'existing': false};

			if (PREFERENCES_ALL[`sync`]) {
				PREFERENCE[`existing`] = (PREFERENCES_ALL[`sync`]).hasOwnProperty(PREFERENCE[`name`]);
			}

			if (!PREFERENCE[`existing`]) {
				// Do not allow synchronized data to interfere with managed data.
				forget(PREFERENCE[`name`]);
				write(PREFERENCE[`name`], null, PREFERENCES_ALL[`managed`][PREFERENCE[`name`]]);
			}

		});
	}

	// Import build data
	if (PREFERENCES_ALL[`build`]) {
		(Object.keys(PREFERENCES_ALL[`build`])).forEach((item) => {
			let PREFERENCE = {'name': item, 'existing': false};

			PREFERENCE[`existing`] = (
				((PREFERENCES_ALL[`sync`]) ? (PREFERENCES_ALL[`sync`]).hasOwnProperty(PREFERENCE[`name`]) : false) ||
					((PREFERENCES_ALL[`managed`]) ? (PREFERENCES_ALL[`managed`]).hasOwnProperty(PREFERENCE[`name`]) : false) ||
					((PREFERENCES_ALL[`local`]) ? (PREFERENCES_ALL[`local`]).hasOwnProperty(PREFERENCE[`local`]) : false)
			);

			if (!PREFERENCE[`existing`]) {
				write(PREFERENCE[`name`], null, PREFERENCES_ALL[`build`][PREFERENCE[`name`]], -1);
			}

		});
	}
}
