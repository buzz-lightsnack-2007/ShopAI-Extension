/* Watchman.js
Be sensitive to changes and update the state.
*/

(async () => {
  // Import modules.
  let secretariat = await import(
    chrome.runtime.getURL("scripts/secretariat.js")
  );
  let filters = await import(chrome.runtime.getURL("scripts/filters.js"));
  let reader = await import(chrome.runtime.getURL("scripts/reader.js"));

  class watchman {
    /* Check the current URL.

      @param {string} URL the page URL; default value is the current webpage
      @return {dictionary} the filter to follow
      */
    static observe(URL = window.location.href) {
      // Create the variable to determine the corresponding key.
      let activity = false;
      // let filters = secretariat.specifics(`filters`, URL);

      // Check if the filters exist.
      activity = filters;

      return activity;
    }

    /* Act on the page.

        @param {dictionary} filters the filter to work with
        @return {boolean} the state
        */
    static act(filters) {
      console.log(
        "ShopAI works here! Click on the button in the toolbar or website to start.",
      );
      // TODO
    }

    /* Set the program to standby utnil next load.
     */
    static standby() {
      console.log(
        "ShopAI doesn't work here (yet). Expecting something? Try checking your filters. If you know what you're doing, feel free to create a filter yourself.",
      );
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
