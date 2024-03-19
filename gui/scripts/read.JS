/* read_universal
  Read a file stored in the universal strings. */

let messages = {};
let message = "";

function load() {
      fetch("./strings/universal.json")
        .then((response) => response.json())
        .then((jsonData) => {
          messages.universal = jsonData;
        })
        .catch((error) => {
            console.error(error);
        });
}

load();


export default class texts {
  static universal (message_name) {
    /* Read a universal message name. */

    let message_name_valid = messages.universal.hasOwnProperty(message_name);

    if (message_name_valid) {
      message = messages.universal[message_name].join("\n");
    } else {message = "";}

    return (message);
  }

  static localized (message_name, params = []) {
    if (params) {
      message = chrome.i18n.getMessage(message_name, params);
    } else {
      message = chrome.i18n.getMessage(message_name);
    }

    return(message);
  }
}
