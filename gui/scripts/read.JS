/* read_universal
  Read a file stored in the universal strings. */

let messages = {};
let message = "";



export default class texts {
  static localized (message_name, params = []) {
    if (params) {
      message = chrome.i18n.getMessage(message_name, params);
    } else {
      message = chrome.i18n.getMessage(message_name);
    }

    return(message);
  }
}

/* This reads the message from its source. This is a fallback for the content scripts, who doesn't appear to read classes.

@param {string} source the source name, with accepted parameters "localized" and "fallback"
@param {string} message the message name
@return {string} the message
*/
export function read(message_name, params) {

  let message;

    message = texts.localized(message_name, params);
    break;

  return (message);

}
