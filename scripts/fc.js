/* fc.js
This does not stand for "FamiCom" but instead on Finalization and Completion. This script provides installation run scripts.
*/

import { init, read, write } from "./secretariat.js";
import filters from "./filters.js";
let config = chrome.runtime.getURL("config/config.json");

export default class fc {
  // Start the out of the box experience.
  static hello() {
    // the OOBE must be in the config.
    fetch(config)
      .then((response) => response.json())
      .then((jsonData) => {
        let configuration = jsonData[`OOBE`];

        if (configuration) {
          configuration.forEach((item) => {
            chrome.tabs.create({ url: item }, function (tab) {});
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // Initialize the configuration. 
  static setup() {
    // the OOBE must be in the config.
    fetch(config)
      .then((response) => response.json())
      .then(async (jsonData) => {
        // const secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));

        let configuration = jsonData;

        // Run the storage initialization.
        // secretariat.init(configuration);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  static trigger() {
    chrome.runtime.onInstalled.addListener(function (details) {
      if (details.reason == chrome.runtime.OnInstalledReason.INSTALL) {
        fc.hello();
      }
      fc.setup();
    });
  }

  // main function 
  static run() {
    fc.trigger();
    fc.every();
  }

  static async every() {
    read([`settings`,`sync`]).then(async (DURATION_PREFERENCES) => {
      // Forcibly create the preference if it doesn't exist. It's required! 
      if (!(typeof DURATION_PREFERENCES).includes(`obj`) || DURATION_PREFERENCES == null || Array.isArray(DURATION_PREFERENCES)) {
        DURATION_PREFERENCES = {};
        DURATION_PREFERENCES[`duration`] = 24;
  
        // Write it. 
        write([`settings`, `sync`], DURATION_PREFERENCES, -1);
      };
  
      if (((typeof DURATION_PREFERENCES).includes(`obj`) && DURATION_PREFERENCES != null && !Array.isArray(DURATION_PREFERENCES)) ? ((DURATION_PREFERENCES[`duration`]) ? (DURATION_PREFERENCES[`duration`] > 0) : false) : false) {
        // Convert DURATION_PREFERENCES[`duration`]) from hrs to milliseconds.
        DURATION_PREFERENCES[`duration`] = DURATION_PREFERENCES[`duration`] * 60 * 60 * 1000;
        let FILTERS = new filters;
  
        // Now, set the interval. 
        let updater_set = () => {
          setInterval(async () => {
            // Update the filters. 
            filters.update();
          }, DURATION_PREFERENCES[`duration`]);
        };
  
        // Provide a way to cancel the interval. 
        let updater_cancel = () => {
  
        }
      };
    })

  };
}
