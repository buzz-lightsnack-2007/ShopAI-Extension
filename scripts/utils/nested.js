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
               PATH[`remain`] = PATH[`all`];
               PATH[`selected`] = String(PATH[`remain`].shift()).trim();

               // Get the selected data.
               DATA = DATA[PATH[`selected`]];

               // must run if there is actually a parameter to test
               if (PATH[`remain`].length > 0) {
                    // Recursively run to make use of the existing data.
                    DATA = nested.dictionary.get(DATA, PATH[`remain`]);
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
     static set(data, path, value) {
          let DATA = data, PATH = path, VALUE = value;

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
               DATA[PATH[`current`]] = VALUE;
          }

          // Return the value.
          return (DATA);
     }
}

export {nested as default};