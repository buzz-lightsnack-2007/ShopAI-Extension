/* read_universal
  Read a file stored in the universal strings. */

let messages = {};
let message = "";

export default class texts {
  /* This reads the message from its source. This is a fallback for the content scripts, who doesn't appear to read classes.

  @param {string} message the message name
  @param {boolean} autofill fill in the message with the template name when not found
  @param {list} params the parameters
  @return {string} the message
  */

  static localized(message_name, autofill = false, params = []) {
    if (params && (params ? params.length > 0 : false)) {
      message = chrome.i18n.getMessage(message_name, params);
    } else {
      message = chrome.i18n.getMessage(message_name);
    }

    // When the message is not found, return the temporary text.
    if (!message && autofill) {
      message = message_name;
    }

    return message;
  }
}

export function read(message_name, autofill, params) {
  let message;

  message = texts.localized(message_name, autofill, params);

  return message;
}
