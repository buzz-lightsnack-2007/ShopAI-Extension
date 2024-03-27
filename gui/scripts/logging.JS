/*
logging.JS
Send messages for logging.
*/

export default class logging {
  /*
  Raise an error message.

  @param {number} ERROR_CODE the error code
  @param {number} ERROR_MESSAGE the custom error message
  */
  static error(ERROR_CODE, ERROR_MESSAGE, critical = true) {
    (async () => {
      // Import the templating.
      const texts = await import(chrome.runtime.getURL("gui/scripts/read.JS"));

      // Display the error message.
      console.error(texts.read(`error_msg`, [ERROR_CODE, ERROR_MESSAGE]));
      if (critical) {
        alert(texts.read(`error_msg_GUI`, [String(ERROR_CODE)]))
      };
    })();
  }
}
