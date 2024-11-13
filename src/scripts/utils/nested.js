import { RegExManager } from "./RegExManager.js";

class nested {}
nested.dictionary = class dictionary {
     /*
     Get the data from the dictionary.

     @param {object} data the data to be used
     @param {string} path the path to the data
     @return {object} the data
     */
     static get(data, path) {
          let DATA = data;

          // Set the path.
          let PATH = {};
          PATH[`all`] = (Array.isArray(path))
               ? path
               : (path && (typeof path).includes(`str`)) ? path.trim().split(`,`) : [];

          // Pull the data out.
          if (DATA != null && DATA != undefined && PATH[`all`].length) {
               PATH[`remain`] = [...PATH[`all`]];
               PATH[`selected`] = String(PATH[`remain`].shift()).trim();

               // Get the selected data.
               if (Object.hasOwn(DATA, PATH[`selected`])) {
                    DATA = (PATH[`remain`].length)
                         ? nested.dictionary.get(DATA[PATH[`selected`]], PATH[`remain`])
                         : DATA[PATH[`selected`]];
               } else if (!Object.hasOwn(DATA, PATH[`selected`])) {
                    DATA = null;
               };
          };

          // Now return the data.
          return DATA;
     }

     /*
     Update a data with a new value.

     @param {object} data the data to be used
     @param {string} path the path to the data
     @param {object} value the value to be used
     @return {object} the data
     */
     static set(data, path, value, options = {}) {
          let DATA = data, PATH = path, VALUE = value;
          (DATA == null) ? DATA = {} : false;

          // Convert path into an array if not yet set.
          PATH = (Array.isArray(PATH)) ? PATH : (PATH && (typeof PATH).includes(`str`)) ? PATH.trim().split(`,`) : [];

          // Get the current path.
          PATH = {"all": PATH};
          PATH[`target`] = PATH[`all`];
          PATH[`current`] = String(PATH[`target`].shift()).trim();

          if (PATH[`target`].length > 0) {
               (DATA[PATH[`current`]] == null) ? DATA[PATH[`current`]] = {} : false;
               DATA[PATH[`current`]] = nested.dictionary.set(DATA[PATH[`current`]], PATH[`target`], VALUE);
          } else {
               if ((typeof DATA[PATH[`current`]]).includes(`obj`) && (typeof VALUE).includes(`obj`) && !Array.isArray(DATA[PATH[`current`]]) && !Array.isArray(VALUE) && DATA[PATH[`current`]] && VALUE && ((options && (typeof options).includes(`obj`)) ? (options[`strict`] || options[`override`]) : true)) {
                    Object.assign(DATA[PATH[`current`]], VALUE);
               } else {
                    DATA[PATH[`current`]] = VALUE;
               };
          }

          // Return the value.
          return (DATA);
     }

    	/* More enhanced searching.

	@param {object} data the data
	@param {string} value the value to search
	@param {object} options the options
	@return {object} the results
	*/
	static search(DATA, TERM, OPTIONS) {
		// Set the default options.
		OPTIONS = Object.assign({}, {"strictness": 0}, OPTIONS);
		let RESULTS;

		if (DATA && ((typeof DATA).includes(`obj`) && !Array.isArray(DATA))) {
			if (!TERM || ((typeof TERM).includes(`str`) ? !TERM.trim() : false)) {
				RESULTS = DATA;
			} else {
				RESULTS = {};

				// Sequentially search through the data, first by key.
				if (OPTIONS[`mode`] != `criteria`) {
					(Object.keys(DATA)).forEach((DATA_NAME) => {
						if (OPTIONS[`strictness`] > 1 ? DATA_NAME == TERM : (DATA_NAME.includes(TERM) || TERM.includes(DATA_NAME))) {
							RESULTS[DATA_NAME] = DATA[DATA_NAME];
						}
					});
				};

				// Get the additional criteria.
				if ((OPTIONS[`mode`] != `root`) && OPTIONS[`criteria`]) {
					let ADDITIONAL_PLACES = (!Array.isArray(OPTIONS[`criteria`])) ? OPTIONS[`criteria`].split(`,`) : OPTIONS[`criteria`];

					// Search through the data.
					if (ADDITIONAL_PLACES) {
						// Perform a sequential search on the additional criteria.
						ADDITIONAL_PLACES.forEach((ADDITIONAL_PLACE) => {
							Object.keys(DATA).forEach((DATA_NAME) => {
								let VALUE = {};
								VALUE[`parent`] = DATA[DATA_NAME];

								if (VALUE[`parent`] ? (typeof (VALUE[`parent`])).includes(`obj`) : false) {
									VALUE[`current`] = nested.dictionary.get(VALUE[`parent`], ADDITIONAL_PLACE);


									if (VALUE[`current`]
										? ((OPTIONS[`strictness`] >= 1)
											? VALUE[`current`] == TERM
											: (
												((OPTIONS[`strictness`] < 0.5)
													? (VALUE[`current`].includes(TERM))
													: false)
												|| (RegExManager.test(VALUE[`current`])
													? (new RegExp(VALUE[`current`])).test(TERM)
													: false)))
										: false) {
										RESULTS[DATA_NAME] = DATA[DATA_NAME];
									};
								};
							})
						})
					};
				};
			};

		};

		// Return the results.
		return RESULTS;
	};
};

export {nested as default};
