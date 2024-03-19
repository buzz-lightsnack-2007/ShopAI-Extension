/* compat.js
You shouldn't be opening the HTMLs elsewhere. */

// Import modules.
import texts from "./read.JS";

// Initialize browser data.
let browser_data = {};

function refresh() {
  /* Update variable containing the browser data.

  Returns: (dict) the updated browser data
  */

  browser_data.URL = window.location.href;
  return (browser_data.URL);
}

export default class compat {
  static restrict() {
    /* Restrict pages containing this function from being loaded outside the extension.

    Returns: (bool) page open is correct
    */

    refresh();

    const browser_extension_URL_contents = new RegExp(`^(?!file:\/\/|http:\/\/|https:\/\/)(.*-extension:\/\/.*)`);
    const browser_condition_met = browser_extension_URL_contents.test(browser_data.URL);
    if (!browser_condition_met) {
      alert(texts.universal(`invalid_open`));
    }

    return (browser_condition_met);
  }
}
