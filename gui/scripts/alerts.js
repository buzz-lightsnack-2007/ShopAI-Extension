/* alerts.js
Alert management system.
*/

export default class alerts {
  static confirm_action() {
    let user_response = false;

    (async () => {
      // Import the module.
      let reader = (await import(chrome.runtime.getURL("gui/scripts/read.js")))[
        `texts`
      ];

      // Get the user response.
      user_response = confirm(
        reader.localized(`GUI_alert_confirm_action_text`),
      );
    })();
    // Return the user response.
    return user_response;
  }

  static log(message) {
    console.log(message);
    try {
      M.toast({ text: message });
    } catch (err) {}
  }

  static warn(message) {
    console.warn(message);
    try {
      M.toast({ text: message });
    } catch (err) {}
  }
}
