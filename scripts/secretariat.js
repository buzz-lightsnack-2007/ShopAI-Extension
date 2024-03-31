/* secretriat.js
Manage the local cache.
*/

import logging from "/gui/scripts/logging.JS";

/* Read all stored data in the browser cache.

@param {array} DATA_NAME the data name
@param {int} CLOUD determine cloud reading, which is otherwise set to automatic (0)
@param {string} PARAMETER_CHECK Determine which parameter to check via regular expressions.
@return {object} the data
*/
export async function read(DATA_NAME, CLOUD = 0, PARAMETER_TEST = null) {
  // Initialize the selected pref data.
  let DATA = {},
    DATA_ALL = {},
    DATA_RETURNED = {};

  // Convert the entered prefname to an array if it is not one.
  if (!(typeof DATA_NAME).includes(`object`)) {
    // Avoid null
    if ((typeof DATA_NAME).includes(`str`) ? DATA_NAME.trim() : DATA_NAME) {
      // Syntax of splitting is by commas.
      DATA_NAME = String(DATA_NAME).trim().split(",");
    }
  }

  /*
      Get all dataset.

      @param {number} SOURCE the data source
  */
  async function read_database(SOURCE = -1) {
    let data = {};
    let data_returned;

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
    if (SOURCE > 0) {
      data_returned = read_database_sync();
    } else {
      data_returned = read_database_local();
    }

    return data_returned;
  }

  /* Recursively find through each data, returning either that value or null when the object is not found.

  @param {dictionary} DATA_ALL the data
  @param {object} DATA_PATH the path of the data
  @return {object} the data
  */
  function find_data(DATA_ALL, DATA_PATH, PARAMETER_TEST) {
    // Pull the data out.
    let DATA_PATH_SELECTED = String(DATA_PATH.shift()).trim();
    let DATA_SELECTED = DATA_ALL;

    // Only run when the data is valid.
    if (DATA_ALL) {
      if (DATA_SELECTED) {
        // Get the selected data.
        DATA_SELECTED = DATA_ALL[DATA_PATH_SELECTED];

        if (DATA_PATH.length > 0) {
          // Recursively run to make use of the existing data.
          DATA_SELECTED = find_data(DATA_SELECTED, DATA_PATH, PARAMETER_TEST);
        }
      } else if (PARAMETER_TEST && DATA_SELECTED) {
        let QUALIFIED = false;

        // The expected keys are "field" and "test value"
        DATA_SELECTED_KEYS = Object.keys(DATA_SELECTED);
        if (PARAMETER_TEST[`field`] && PARAMETER_TEST[`test value`]) {
          // Perform a sequential search.
          for (
            let DATA_SELECTED_KEY_INDEX = 0;
            DATA_SELECTED_KEY_INDEX < DATA_SELECTED_KEYS.length || !QUALIFIED;
            DATA_SELECTED_KEY_INDEX++
          ) {
            PARAMETER_TEST[`value`] =
              DATA_SELECTED[DATA_SELECTED_KEYS[DATA_SELECTED_KEY_INDEX]][
                PARAMETER_TEST[`field`]
              ];
            if (PARAMETER_TEST[`value`]) {
              QUALIFIED =
                new RegExp(String(PARAMETER_TEST[`value`])).test(
                  PARAMETER_TEST[`test value`],
                ) ||
                PARAMETER_TEST[`test value`].includes(PARAMETER_TEST[`value`]);
            }

            if (QUALIFIED) {
              DATA_SELECTED =
                DATA_SELECTED[DATA_SELECTED_KEYS[DATA_SELECTED_KEY_INDEX]];
              break;
            }
          }

          if (!QUALIFIED) {
            DATA_SELECTED = null;
          }
        } else {
          // It is not valid, so do not return anything.
          DATA_SELECTED = null;
        }
      }
    }

    // Now return the data.
    return DATA_SELECTED;
  }

  // Read data from local and sync storage (asynchronous operations)
  try {
    if (CLOUD <= 0) {
      [DATA_ALL[`local`]] = await Promise.all([read_database(-1)]);
    }
    if (CLOUD >= 0) {
      [DATA_ALL[`sync`]] = await Promise.all([read_database(1)]);
    }
  } catch ({ name, message }) {
    logging.error(name, message);
  }

  // Let's get through everything and then determine which one has…
  Object.keys(DATA_ALL).forEach((DATA_SOURCE) => {
    if (DATA_ALL[DATA_SOURCE]) {
      DATA[DATA_SOURCE] = DATA_NAME
        ? find_data(DATA_ALL[DATA_SOURCE], DATA_NAME, PARAMETER_TEST)
        : DATA_ALL[DATA_SOURCE];
    }
  });

  // Now return the data.
  DATA_RETURNED[`source`] =
    CLOUD != 0
      ? CLOUD > 0
        ? `sync`
        : `local`
      : (DATA[`sync`] ? DATA[`sync`].length <= 0 : DATA[`sync`])
        ? `sync`
        : `local`;
  DATA_RETURNED[`value`] = DATA[DATA_RETURNED[`source`]];

  return DATA_RETURNED[`value`];
}

/* Write the data on the selected prefname.

@param {string} PATH the preference name
@param {object} DATA the new data to be written
@param {int} CLOUD store in the cloud; otherwise set to automatic
*/
export function write(PATH, DATA, CLOUD = -1) {
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

  read(null, CLOUD).then((DATA_ALL) => {
    // handle empty collected data.
    if (!DATA_ALL) {
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
  });
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
    let alerts = (await import(chrome.runtime.getURL(`gui/scripts/alerts.js`)))[
      `alerts`
    ];

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
            write([preference, subpreference], data, CLOUD);
          }
        } else {
          // Remove that particular data.
          if (CLOUD <= 0) {
            chrome.storage.local.get(null, (data) => {
              delete data[preference];

              chrome.storage.local.set(data, (result) => {});
            });
          }
          if (CLOUD >= 0) {
            chrome.storage.sync.get(null, (data) => {
              delete data[preference];

              chrome.storage.sync.set(data, (result) => {});
            });
          }
        }
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
  })();

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
