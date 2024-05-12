/* secretriat.js
Manage the local cache.
*/

import logging from "/scripts/logging.js";
import texts from "/scripts/mapping/read.js";
import hash from "/scripts/utils/hash.js";
import nested from "/scripts/utils/nested.js";

/*
Global data storage, which refers to local and synchronized storage
*/
class global {
	/* Read all stored data in the browser cache.
	
	@param {array} name the data name
	@param {int} cloud determines cloud reading, which is otherwise set to automatic (0)
	@return {object} the data
	*/
	static async read(name, cloud = 0) {
		/*
		Get all storage values.

		@param {number} SOURCE the data source
		*/
		function pull(SOURCE = -1) {
			return (chrome.storage[(SOURCE > 0) ? `sync` : `local`].get(null));
		}

		// Initialize the selected pref data.
		let DATA, DATA_RETURNED;

		// Convert the entered prefname to an array if it is not one.
		let NAME = (!Array.isArray(name) && name != null) 
			? String(name).trim().split(`,`)
			: name;
		
		
		switch (cloud) {
			case 0:
				DATA = {}; DATA_RETURNED = {};

				DATA[`sync`] = await global.read((NAME) ? [...NAME] : null, 1);
				DATA[`local`] = await global.read((NAME) ? [...NAME] : null, -1);
	
				// Now return the data.
				DATA_RETURNED[`source`] = (DATA[`sync`] != null && !(typeof DATA[`sync`]).includes(`undef`)) ? `sync` : `local`;
				DATA_RETURNED[`value`] = DATA[DATA_RETURNED[`source`]];
	
				// Override the data with managed data if available. 
				if ((NAME != null) ? NAME.length : false) {
					DATA[`managed`] = await managed.read((NAME) ? [...NAME] : null);
					DATA_RETURNED[`value`] = (DATA[`managed`] != null) ? DATA[`managed`] : DATA_RETURNED[`value`];
				};

				return DATA_RETURNED[`value`];
				break;
			default:
				cloud = (cloud > 0) ? 1 : -1;
				DATA = await pull(cloud);
				DATA_RETURNED = (NAME) ? nested.dictionary.get(DATA, NAME) : DATA;
	
				return(DATA_RETURNED);
				break;
		};
	};

	/* More enhanced searching.

	@param {Array} SOURCE the source of the data
	@param {string} TERM the term to search
	@param {Array} ADDITIONAL_PLACES additional places to search
	@param {object} OPTIONS the options
	@return {Array} the results
	*/
	static async search(SOURCE, TERM, ADDITIONAL_PLACES, STRICT = 0, OPTIONS = {}) {
		let DATA = await global.read(SOURCE, (OPTIONS[`cloud`] != null) ? OPTIONS[`cloud`] : 0);
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
					ADDITIONAL_PLACES.forEach((ADDITIONAL_PLACE) => {
						// Recursively search
						RESULTS = Object.assign({}, RESULTS, global.search(SOURCE, TERM, ADDITIONAL_PLACE, STRICT));
					})
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
	};

	/* Write the data on the selected prefname.

	@param {string} path the preference name
	@param {object} data the new data to be written
	@param {int} CLOUD store in the cloud; otherwise set to automatic
	@param {object} OPTIONS the options
	*/
	static async write(path, data, CLOUD = -1, OPTIONS = {}) {
		let DATA_INJECTED = {};

		async function verify (NAME, DATA) {
			let DATA_CHECK = {};

			// Verify the presence of the data.
			DATA_CHECK[`state`] = await compare([...NAME], DATA);

			(!DATA_CHECK[`state`])
				? logging.error((new texts(`error_msg_save_failed`)).localized, NAME.join(` → `), JSON.stringify(DATA))
				: ((((typeof OPTIONS).includes(`obj`) && OPTIONS != null) ? (!(!!OPTIONS[`silent`])) : true)
					? new logging (new texts(`saving_done`).localized)
					: false);
			
			return (DATA_CHECK[`state`]);
		}

		let DATA_ALL;

		// Inform the user that saving is in progress.
		if (((typeof OPTIONS).includes(`obj`) && OPTIONS != null) ? (!(!!OPTIONS[`silent`])) : true) {
			let LOG = new logging ((new texts(`saving_current`)).localized, (new texts(`saving_current_message`)).localized, false)
		};

		// Get all data and set a blank value if it doesn't exist yet. 
		DATA_ALL = await global.read(null, CLOUD);
		DATA_ALL = ((DATA_ALL != null && DATA_ALL != undefined && (typeof DATA_ALL).includes(`obj`)) ? Object.keys(DATA_ALL).length <= 0 : true) 
			? {}
			: DATA_ALL;

		// Set the data name. 
		let DATA_NAME = (!(Array.isArray(path)) && path && path != undefined)
			? String(path).trim().split(",")
			: ((path != null) ? path : []) // Ensure that path isn't empty. 

		// Merge!
		DATA_INJECTED = nested.dictionary.set(DATA_ALL, (DATA_NAME != null) ? [...DATA_NAME] : DATA_NAME, data, OPTIONS);

		// If cloud is not selected, get where the data is already existent. 
		(CLOUD == 0 || CLOUD == null)
			? (CLOUD = (DATA_ALL[`local`] != null) ? -1 : 1)
			: false;

		// Write!
		chrome.storage[(CLOUD > 0) ? `sync` : `local`].set(DATA_INJECTED);
		(typeof LOG).includes(`undef`) ? false : LOG.clear();
		return ((OPTIONS[`verify`] != null ? (OPTIONS[`verify`]) : true) ? verify(DATA_NAME, data) : true);
	}

	/*
	Removes a particular data. 

	@param {string} preference the preference name to delete
	@param {string} subpreference the subpreference name to delete
	@param {int} CLOUD the storage of the data
	@return {boolean} the user's confirmation
	*/
	static async forget(preference, cloud = 0, override = false) {
		// Confirm the action.
		let CONFIRMATION = override ? override : await logging.confirm();

		if (CONFIRMATION) {
			if (preference) {
				/*
				Erase applicable storage from a provider. 

				@param {string} name the name of the data
				@param {int} cloud the usage of cloud storage
				*/
				async function erase(path, cloud) {
					/*
					Securely erase by replacing any existing value with null.

					@param {string} name the name of the data
					@param {int} cloud the usage of cloud storage
					*/
					function secure(name, cloud) {
						let PATH = name; 
						// Check if the value already exists. 
						return(global.read([...PATH], cloud).then(async (DATA) => {
							return((DATA != null)
								// Then erase the data. 
								? await global.write(PATH, null, cloud, {"strict": true, "verify": false})
								: true);
						}));
					};
					
					/*
					Remove the key from existence. 

					@param {string} name the name of the data
					@param {int} cloud the usage of cloud storage
					*/
					async function eliminate(name, cloud) {
						// Store the variable seperately to avoid overwriting. 
						let PATH = name;

						// There are two methods to erase the data. 
						// The first only occurs when the root is selected and the path is just a direct descendant. 
						if (PATH.length == 1) {
							chrome.storage[(cloud > 0) ? `sync` : `local`].remove(PATH[0]);
						} else {
							(global.read(((PATH.length > 1) ? [...PATH.slice(0,-1)] : null), cloud)).then((DATA) => {
								// Move the existing data into a new object to help in identifying.
								DATA = {"all": DATA};

								if ((((typeof (DATA[`all`])).includes(`obj`) && !Array.isArray(DATA[`all`])) ? Object.keys(DATA[`all`]) : false) ? Object.hasOwn(DATA[`all`], PATH[PATH.length - 1]) : false) {
									DATA[`modified`] = DATA[`all`];
							
									delete DATA[`modified`][PATH[PATH.length - 1]];

									return(global.write(((PATH && Array.isArray(PATH)) ? (PATH.slice(0,-1)) : null), DATA[`modified`], cloud, {"strict": true}));
								}
							});
						}

						
					};

					// Set the data path. 
					let DATA_NAME = (!(Array.isArray(path)) && path && path != undefined)
						? String(path).trim().split(",")
						: ((path != null) ? path : []) // Ensure that path isn't empty. 

					await secure([...DATA_NAME], cloud);
					eliminate([...DATA_NAME], cloud);
				}

				(cloud >= 0) ? erase(preference, 1) : false;
				(cloud <= 0) ? erase(preference, -1) : false;
			} else {
				// Clear the data storage.
				(cloud >= 0) ? chrome.storage.sync.clear() : false;
				(cloud <= 0) ? chrome.storage.local.clear() : false;
			}
		}

		return CONFIRMATION;
	}
}

class session {
	/*
	Recall session storage data. 
	
	@param {string} path the path to the data
	@return {object} the data
	*/
	static async read(path) {
		// Change PATH to array if it isn't. 
		let PATH = (!(Array.isArray(path)) && path && path != undefined)
			? String(path).trim().split(",")
			: ((path != null) ? path : []);

		// Prepare data. 
		let DATA = {};
		DATA[`all`] = await chrome.storage.session.get(null);
		(DATA[`all`]) ? DATA[`selected`] = nested.dictionary.get(DATA[`all`], [...PATH]) : false;
		
		return (DATA[`selected`]);
	}

	/*
	Write the data to a specified path. 

	@param {string} PATH the path to the data
	@param {object} DATA the data to be written
	*/
	static async write(PATH, DATA) {
		async function verify (NAME, DATA) {
			let DATA_CHECK = {};

			// Verify the presence of the data.
			DATA_CHECK[`state`] = await compare(null, [await session.read([...NAME]), DATA]);

			// Only notify when writing failed. 
			(!DATA_CHECK[`state`])
				? logging.error((new texts(`error_msg_save_failed`)).localized, NAME.join(` → `), JSON.stringify(DATA))
				: true;

			return (DATA_CHECK[`state`]);
		}

		DATA = {"write": DATA};
		DATA[`all`] = await session.read(null);
		((DATA[`all`] != null && (typeof DATA[`all`]).includes(`obj`)) ? Object.keys(DATA[`all`]).length <= 0 : true)
			? DATA[`all`] = {}
			: false;

		let TARGET = (!(typeof PATH).includes(`obj`)) ? String(PATH).trim().split(",") : PATH;

		// Merge!
		DATA[`inject`] = nested.dictionary.set(DATA[`all`], [...TARGET], DATA[`write`]);

		// Write!
		chrome.storage.session.set(DATA[`inject`]);
		return(await verify(TARGET, DATA[`write`]));
	}
}

/*
Compare a data against the stored data. Useful when comparing dictionaries.

@param {string} PATH the name
@param {object} DATA the data to compare to
@return {boolean} the result: true is when the data is the same, false otherwise
*/
export async function compare(PATH, DATA) {
	/*
	Compare the data.

	@param {object} DATA_ONE the first data
	@param {object} DATA_TWO the second data
	@return {boolean} the result
	*/
	async function comparison(DATA_ONE, DATA_TWO) {
		let RESULT = true;

		// The first round of checking is on the data type.
		RESULT = ((typeof DATA_ONE == typeof DATA_TWO) ? ((Array.isArray(DATA_TWO) == Array.isArray(DATA_ONE)) && !((DATA_ONE == null && DATA_TWO != null) || (DATA_ONE != null && DATA_TWO == null))) : false) ? ((typeof DATA_ONE).includes(`obj`) ? (await hash.digest(DATA_ONE, {"output": "Number"}) == await hash.digest(DATA_TWO, {"output": "Number"})) : DATA_ONE == DATA_TWO) : false;

		return (RESULT);
	}


	let COMPARISON = {};
	COMPARISON[`test`] = (PATH) ? DATA : DATA[1];
	COMPARISON[`against`] = (PATH) ? (await global.read((Array.isArray(PATH)) ? [...PATH] : PATH)) : DATA[0];
	COMPARISON[`result`] = comparison(COMPARISON[`against`], COMPARISON[`test`]);

	// Return the result.
	return (COMPARISON[`result`]);
}

class template {
	/* Initialize the storage.
	
	@param {dictionary} data this build's managed data
	*/
	static set(data) {
		let PREFERENCES = {};
		PREFERENCES[`all`] = {};

		((typeof data).includes(`obj`) && data != null) ? PREFERENCES[`all`][`build`] = data : false;

		// Read all data. 
		[`managed`, `local`, `sync`].forEach((SOURCE) => {
			chrome.storage[SOURCE].get(null, (DATA) => {
				PREFERENCES[`all`][SOURCE] = DATA;
			})
		});

		// Merge the data. 
		// Managed > Synchronized > Imported > Local
		// Set managed preferences. 
		managed.reinforce();

		// Import build data
		if (PREFERENCES[`all`][`build`]) {
			Object.keys(PREFERENCES[`all`][`build`]).forEach((item) => {
				let PREFERENCE = { name: item, existing: false };

				PREFERENCE[`existing`] =
					(PREFERENCES[`all`][`sync`]
						? PREFERENCES[`all`][`sync`].hasOwnProperty(PREFERENCE[`name`])
						: false) ||
					(PREFERENCES[`all`][`managed`]
						? PREFERENCES[`all`][`managed`].hasOwnProperty(PREFERENCE[`name`])
						: false) ||
					(PREFERENCES[`all`][`local`]
						? PREFERENCES[`all`][`local`].hasOwnProperty(PREFERENCE[`local`])
						: false);

				(!PREFERENCE[`existing`])
					? global.write(PREFERENCE[`name`], PREFERENCES[`all`][`build`][PREFERENCE[`name`]], -1)
					: false;
			});
		}
	};

	/*
	Use our preferences when handling the data.
	*/
	static configure() {
		chrome.storage.session.setAccessLevel(
			{accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'}
		);
	}
}

/*
managed data functions
*/
class managed {
	/*
	Reinforce managed data. 
	*/
	static reinforce() {
		chrome.storage.managed.get(null, (DATA_MANAGED) => {
			// Saving the data asynchronously
			(Object.keys(DATA_MANAGED)).forEach(async (SOURCE) => {
				await write(SOURCE, DATA_MANAGED[SOURCE], -1, {"strict": false});
			});
		});
	}

	/*
	Read for any applicable managed data. 

	@param {string} name the name of the data
	@return {boolean} the result
	*/
	static async read(name) {
		function find(DATA_ALL, DATA_PATH) {
			let DATA = DATA_ALL;

			// Pull the data out.
			if (DATA_ALL != null && (Array.isArray(DATA_PATH) && DATA_PATH != null) ? DATA_PATH.length > 0 : false) {
				let DATA_PATH_SELECTED = String(DATA_PATH.shift()).trim();

				// Get the selected data.
				DATA = DATA_ALL[DATA_PATH_SELECTED];

				// must run if there is actually a parameter to test
				if (DATA_PATH.length > 0) {
					// Recursively run to make use of the existing data.
					DATA = find(DATA, DATA_PATH);
				};
			} else {
				return null;
			}

			// Now return the data.
			return DATA;
		}

		let DATA = {};
		DATA[`all`] = await chrome.storage.managed.get(null);
		DATA[`selected`] = ((DATA[`all`] && (typeof DATA[`all`]).includes(`obj`) && !Array.isArray(DATA[`all`])) ? Object.keys(DATA[`all`]).length : false)
			? find(DATA[`all`], name)
			: null;
		
		return (DATA[`selected`]);
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

export {global, session, template, managed};
