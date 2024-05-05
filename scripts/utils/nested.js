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
}

export {nested as default};