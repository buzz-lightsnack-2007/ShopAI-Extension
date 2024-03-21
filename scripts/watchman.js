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
            Returns: (dictionary) the filter to follow
            */

            // Create the variable to determine the corresponding key.
            let activity = false;
            let filters = secretariat.rules(URL);

            // Check if the filters exist.
            activity = (filters);

            return (activity);
        };

        static act(filters) {
            /* Act on the page.

            Parameters:
              filters: the filter to work with
            Returns: the state
            */

            console.log("ShopAI works here! Click on the button in the toolbar or website to start.");
            // TODO
        }

        static standby() {
          /* Set the program to standby utnil next load.
          */

          console.log("ShopAI doesn't work here (yet). Expecting something? Try checking your filters. If you know what you're doing, feel free to create a filter yourself.");
        }

        static job() {
          /* The main action. */
          let job_task = watchman.observe();
          if (job_task) {
            watchman.act(job_task);
          } else {
            watchman.standby();
          }
        }
    }

    watchman.job();

})();
