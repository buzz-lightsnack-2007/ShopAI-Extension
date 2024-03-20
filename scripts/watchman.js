/* Watchman.js 
Be sensitive to changes and update the state. 
*/

(async () => {
    // Import modules. 
    let secretariat = await import(chrome.runtime.getURL("scripts/secretariat.js"));
    let reader = await import(chrome.runtime.getURL("scripts/reader.js"));

    class watchman {
        static observe(URL = window.location.href) {
            /* Check the current URL. 
            
            Parameters: 
                URL: the page URL; default value is the current webpage
            Returns: (boolean) status
            */

            // Create the variable to determine the corresponding key. 
            let key;

            secretariat.rules(URL);

            return (key);
        };

        static act() {
            // TODO
        };
    };
    
    watchman.observe();
    watchman.act();
})();
