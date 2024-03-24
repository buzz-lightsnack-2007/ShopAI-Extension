/* alerts.js
Alert management system.
*/

export function confirm_action() {
    let user_response = false; 

    (async () => {
        // Import the module. 
        let reader = await import(chrome.runtime.getURL("gui/scripts/read.JS"));

        // Get the user response. 
        user_response = confirm(reader.read(`GUI_alert_confirm_action_text`));

    })();
    // Return the user response. 
    return (user_response);
};
