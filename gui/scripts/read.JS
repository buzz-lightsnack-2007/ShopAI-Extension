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



export default class texts {
  static universal (message_name) {
    /* Read a universal message name. */
    
    // Load the strings here to avoid loading inside another web page, where it is not permitted.  
    load();

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

export function read(source, message_name, params) {
  /* This reads the message from its source. This is a fallback for the content scripts, who doesn't appear to read classes. 
  
  Parameters:
    source: the source name, with accepted parameters "localized" and "fallback"
    message: the message name
  Returns: (string) the message
  */

  let message; 

  // Determine if a fallback is requested
  switch (source) {
    case "universal": 
    case "fallback": 
      message = texts.universal(message_name);
      break;
    default: 
      message = texts.localized(message_name, params);
      break;
  };

  return (message);

}