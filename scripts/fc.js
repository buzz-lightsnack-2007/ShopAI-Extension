/* fc.js
This does not stand for "FamiCom" but instead on Finalization and Completion. This script provides installation run scripts.
*/

import { read, write, init } from "./secretariat.js";

let config = chrome.runtime.getURL("config/config.json");

export default class fc {
  /* Start the out of the box experience. */
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

  /* Initialize the configuration. */
  static setup() {
    // the OOBE must be in the config.
    fetch(config)
      .then((response) => response.json())
      .then((jsonData) => {
        let configuration = jsonData;

        // Run the storage initialization.
        init(configuration);
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

  /* main function */
  static run() {
    fc.trigger();
  }
}
