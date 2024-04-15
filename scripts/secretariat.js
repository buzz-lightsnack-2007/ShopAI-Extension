/* secretriat.js
Manage the local cache.
*/

import logging from "/scripts/logging.js";

/* Read all stored data in the browser cache.

@param {array} DATA_NAME the data name
@param {int} CLOUD determine cloud reading, which is otherwise set to automatic (0)
@param {string} PARAMETER_CHECK Determine which parameter to check via regular expressions.
@return {object} the data
*/
export async function read(DATA_NAME, CLOUD = 0) {
	// Initialize the selected pref data.
	let DATA, DATA_RETURNED;

	/*
	Get all storage values. 

	@param {number} SOURCE the data source
	*/
	async function read_database(SOURCE = -1) {
		let data, data_returned;

		async function read_database_local() {
			return new Promise((resolve, reject) => {
				chrome.storage.local.get(null, function (result) {
					if (chrome.runtime.lastError) {
						// Something went wrong
						reject(new Error(chrome.runtime.lastError));
					} else {
						// If the key exists, return the value
						resolve(result);
					}
				});
			});
		}

		async function read_database_sync() {
			return new Promise((resolve, reject) => {
				chrome.storage.sync.get(null, function (result) {
					if (chrome.runtime.lastError) {
						// Something went wrong
						reject(new Error(chrome.runtime.lastError));
					} else {
						// If the key exists, return the value
						resolve(result);
					}
				});
			});
		}

		// Return the data.
		data_returned = (SOURCE > 0) ? read_database_sync() : read_database_local();
		return data_returned;
	}

	/* Recursively find through each data, returning either that value or null when the object is not found.

	@param {dictionary} DATA_ALL the data
	@param {object} DATA_PATH the path of the data
	@return {object} the data
	*/
	function find_data(DATA_ALL, DATA_PATH) {
		let DATA = DATA_ALL;

		// Pull the data out.
		if (DATA_ALL != null && (Array.isArray(DATA_PATH) && DATA_PATH != null) ? DATA_PATH.length > 0 : false) {
			let DATA_PATH_SELECTED = String(DATA_PATH.shift()).trim();

			// Get the selected data.
			DATA = DATA_ALL[DATA_PATH_SELECTED];

			// must run if there is actually a parameter to test
			if (DATA_PATH.length > 0) {
				// Recursively run to make use of the existing data.
				DATA = find_data(DATA, DATA_PATH);
			};
		} else {
			return null;
		}

		// Now return the data.
		return DATA;
	}

	// Convert the entered prefname to an array if it is not one.
	if (!Array.isArray(DATA_NAME) && DATA_NAME != null) {
		// Syntax of splitting is by commas.
		DATA_NAME = String(DATA_NAME).trim().split(",");
	}

	switch (CLOUD) {
		case 0: 
			DATA = {}; DATA_RETURNED = {};

			DATA[`sync`] = await read((DATA_NAME) ? [...DATA_NAME] : null, 1);
			DATA[`local`] = await read((DATA_NAME) ? [...DATA_NAME] : null, -1);

			// Now return the data.
			DATA_RETURNED[`source`] = (DATA[`sync`] != null) ? `sync` : `local`;
			DATA_RETURNED[`value`] = DATA[DATA_RETURNED[`source`]];

			return DATA_RETURNED[`value`];
			break;
		default: 
			CLOUD = (CLOUD > 0) ? 1 : -1;
			DATA = await read_database(CLOUD);
			DATA_RETURNED = (DATA_NAME) ? find_data(DATA, DATA_NAME) : DATA;
			return(DATA_RETURNED);
			break;
	}
}

/* More enhanced searching.

@param {Array} SOURCE the source of the data
@param {string} TERM the term to search
@param {Array} ADDITIONAL_PLACES additional places to search
@param {object} OPTIONS the options
@return {Array} the results
*/
export async function search(SOURCE, TERM, ADDITIONAL_PLACES, STRICT = 0, OPTIONS = {}) {
	let DATA = await read(SOURCE, (OPTIONS[`cloud`] != null) ? OPTIONS[`cloud`] : 0);
	let RESULTS;

	if (DATA) {
		RESULTS = {};

		if (TERM && (!(typeof ADDITIONAL_PLACES).includes(`str`) || !ADDITIONAL_PLACES)) {
			// Sequentially search through the data, first by key.
			(Object.keys(DATA)).forEach((DATA_NAME) => {
				if (STRICT ? DATA_NAME == TERM : (DATA_NAME.includes(TERM) || TERM.includes(DATA_NAME))) {
					RESULTS[DATA_NAME] = DATA[DATA_NAME];
				}
			});
			
			// Then, get the additional places.
			if ((ADDITIONAL_PLACES != null ? Array.isArray(ADDITIONAL_PLACES) : false) ? ADDITIONAL_PLACES.length > 0 : false) {
				for (let PARAMETER_PRIORITY_NUMBER = 0; PARAMETER_PRIORITY_NUMBER < ADDITIONAL_PLACES.length; PARAMETER_PRIORITY_NUMBER++) {
					// Recursively search
					RESULTS = Object.assign({}, RESULTS, search(SOURCE, TERM, ADDITIONAL_PLACES[PARAMETER_PRIORITY_NUMBER], STRICT));
				};
			}
		} else if (((typeof ADDITIONAL_PLACES).includes(`str`) && (ADDITIONAL_PLACES)) ? ADDITIONAL_PLACES.trim() : false) {
			// Perform a sequential search on the data. 
			if ((typeof DATA).includes(`obj`) && !Array.isArray(DATA) && SOURCE != null) {
				let VALUE = {};
				
				for (let DICTIONARY_INDEX = 0; DICTIONARY_INDEX < (Object.keys(DATA)).length; DICTIONARY_INDEX++) {
					VALUE[`parent`] = DATA[(Object.keys(DATA))[DICTIONARY_INDEX]];
					
					/* Test for a valid RegEx. 
					
					@param {string} item the item to test
					*/
					function isRegEx(item) {
						let RESULT = {};
						RESULT[`state`] = false;
						try {
							RESULT[`expression`] = new RegExp(item);
							RESULT[`state`] = true;
						} catch(err) {};

						return (RESULT[`state`]);
					};

					if (((typeof VALUE[`parent`]).includes(`obj`) && !Array.isArray(VALUE[`parent`]) && VALUE[`parent`] != null) ? (Object.keys(VALUE[`parent`])).length > 0 : false) {
						VALUE[`current`] = VALUE[`parent`][ADDITIONAL_PLACES];
					}

					if (VALUE[`current`] ? ((STRICT >= 1) ? VALUE[`current`] == TERM : (((STRICT < 0.5) ? (VALUE[`current`].includes(TERM)) : false) || TERM.includes(VALUE[`current`]) || (isRegEx(VALUE[`current`]) ? (new RegExp(VALUE[`current`])).test(TERM) : false))) : false) {
						// Add the data. 
						RESULTS[(Object.keys(DATA))[DICTIONARY_INDEX]] = (Object.entries(DATA))[DICTIONARY_INDEX][1];
					};
				};
			} else {
				for (let ELEMENT_INDEX = 0; ELEMENT_INDEX < DATA.length; ELEMENT_INDEX++) {
					if (
						((STRICT || (typeof DATA[ELEMENT_INDEX]).includes(`num`)) && DATA[ELEMENT_INDEX] == TERM) ||
						((!STRICT && !((typeof DATA[ELEMENT_INDEX]).includes(`num`)))
							? (TERM.includes(DATA[ELEMENT_INDEX]) || DATA[ELEMENT_INDEX].includes(TERM) || 
								(typeof(DATA[ELEMENT_INDEX])).includes(`str`)
									? new RegExp(DATA[ELEMENT_INDEX]).test(TERM)
									: false
							) : false
						)
					) {
						RESULTS[SOURCE] = DATA;
						break;
					}
				}
			}
		}
	}
	
	return RESULTS;
}

/* Write the data on the selected prefname.

@param {string} PATH the preference name
@param {object} DATA the new data to be written
@param {int} CLOUD store in the cloud; otherwise set to automatic
*/
export async function write(PATH, DATA, CLOUD = -1) {
	let DATA_INJECTED = {};

	/* Forcibly write the data to chrome database

	@param {object} DATA the data
	@param {number} CLOUD the storage
	*/
	function write_database(DATA, CLOUD = 0) {
		// If CLOUD is set to 0, it should automatically determine where the previous source of data was taken from.

		if (CLOUD > 0) {
			chrome.storage.sync.set(DATA);
		} else if (CLOUD < 0) {
			chrome.storage.local.set(DATA);
		}
	}

	/* Appropriately nest and merge the data.

	@param {object} EXISTING the original data
	@param {object} PATH the subpath
	@param {object} VALUE the value
	@return {object} the updated data
	*/
	function nest(EXISTING, SUBPATH, VALUE) {
		let DATABASE = EXISTING;

		// Get the current path.
		let PATH = {};
		PATH[`current`] = String(SUBPATH.shift()).trim();
		PATH[`target`] = SUBPATH;

		if (PATH[`target`].length > 0) {
			if (DATABASE[PATH[`current`]] == null) {
				DATABASE[PATH[`current`]] = {};
			}
			DATABASE[PATH[`current`]] = nest(
				DATABASE[PATH[`current`]],
				PATH[`target`],
				VALUE,
			);
		} else {
			DATABASE[PATH[`current`]] = VALUE;
		}
		// Return the value.
		return DATABASE;
	}

	let DATA_ALL = await read(null, CLOUD);
	if ((DATA_ALL != null && (typeof DATA_ALL).includes(`obj`)) ? Object.keys(DATA_ALL).length <= 0 : true) {
		DATA_ALL = {};
	}

	let DATA_NAME = PATH;

	// Convert the entered prefname to an array if it is not one.
	if (!(typeof SUBPATH).includes(`object`)) {
		// Split what is not an object.
		DATA_NAME = String(PATH).trim().split(",");
	}

	// Merge!
	DATA_INJECTED = nest(DATA_ALL, DATA_NAME, DATA);

	// Write!
	write_database(DATA_INJECTED, CLOUD);
}

/* Dangerous: Resets all data or a domain's data.

@param {string} preference the preference name to delete
@param {string} subpreference the subpreference name to delete
@param {int} CLOUD the storage of the data
@return {boolean} the user's confirmation
*/
export async function forget(preference, CLOUD = 0, override = false) {
	// Confirm the action.
	let forget_action = override ? override : await logging.confirm();

	if (forget_action) {
		if (preference) {
			if (!(Array.isArray(preference))) {
				preference = String(preference).trim().split(",");
			};
			
			let DATA = await read([...preference.slice(0,-1)], CLOUD);
			
			if (((((typeof (DATA)).includes(`obj`) && !Array.isArray(DATA) && DATA != null) ? Object.keys(DATA) : false) ? Object.keys(DATA).includes((preference.slice(-1))[0]) : false)) {
				delete DATA[preference.slice(-1)];
			};

			await write(preference.slice(0,-1), DATA, CLOUD);
		} else {
			// Clear the data storage.
			if (CLOUD >= 0) {
				chrome.storage.sync.clear();
			}
			if (CLOUD <= 0) {
				chrome.storage.local.clear();
			}
		}
	}

	return forget_action;
}

/* Initialize the storage.

@param {dictionary} data this build's managed data
*/
export function init(data) {
	let PREFERENCES_ALL = {};
	PREFERENCES_ALL[`build`] = data;

	// Read all data.
	chrome.storage.managed.get(null, function (DATA_MANAGED) {
		PREFERENCES_ALL[`managed`] = DATA_MANAGED;
	});

	chrome.storage.local.get(null, function (DATA_LOCAL) {
		PREFERENCES_ALL[`local`] = DATA_LOCAL;
	});

	chrome.storage.sync.get(null, function (DATA_SYNC) {
		PREFERENCES_ALL[`sync`] = DATA_SYNC;
	});

	// Merge data.
	// Managed > Synchronized > Imported > Local

	if (PREFERENCES_ALL[`managed`]) {
		Object.keys(PREFERENCES_ALL[`managed`]).forEach((item) => {
			let PREFERENCE = { name: item, existing: false };

			if (PREFERENCES_ALL[`sync`]) {
				PREFERENCE[`existing`] = PREFERENCES_ALL[`sync`].hasOwnProperty(
					PREFERENCE[`name`],
				);
			}

			if (!PREFERENCE[`existing`]) {
				// Do not allow synchronized data to interfere with managed data.
				forget(PREFERENCE[`name`]);
				write(
					PREFERENCE[`name`],
					PREFERENCES_ALL[`managed`][PREFERENCE[`name`]],
				);
			}
		});
	}

	// Import build data
	if (PREFERENCES_ALL[`build`]) {
		Object.keys(PREFERENCES_ALL[`build`]).forEach((item) => {
			let PREFERENCE = { name: item, existing: false };

			PREFERENCE[`existing`] =
				(PREFERENCES_ALL[`sync`]
					? PREFERENCES_ALL[`sync`].hasOwnProperty(PREFERENCE[`name`])
					: false) ||
				(PREFERENCES_ALL[`managed`]
					? PREFERENCES_ALL[`managed`].hasOwnProperty(PREFERENCE[`name`])
					: false) ||
				(PREFERENCES_ALL[`local`]
					? PREFERENCES_ALL[`local`].hasOwnProperty(PREFERENCE[`local`])
					: false);

			if (!PREFERENCE[`existing`]) {
				write(
					PREFERENCE[`name`],
					PREFERENCES_ALL[`build`][PREFERENCE[`name`]],
					-1,
				);
			}
		});
	}
}

/*
Run a script when the browser storage has been changed.

@param {object} reaction the function to run
*/
export function observe(reaction) {
	chrome.storage.onChanged.addListener((changes, namespace) => {
		reaction(changes, namespace);
	});
}
