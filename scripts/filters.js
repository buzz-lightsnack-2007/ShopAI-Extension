/* filters.js
Manage filters.
*/

/* Select the most appropriate filter based on a URL.

@param {string} URL the current URL
*/
export async function select(URL = window.location.href) {}

/* Update all filters or just one.

@param {string} URL the URL to update
@return {boolean} the state
*/
export async function update(URL) {
  console.log("Updating…");
  // Import the updater.
  const secretariat = await import(
    chrome.runtime.getURL("scripts/secretariat.js")
  );
  const net = await import(chrome.runtime.getURL("scripts/net.js"));

  // Apparently, JS doesn't have a native queueing system, but it might best work here.
  class Queue {
    constructor() {
      this.elements = [];
    }

    enqueue(element) {
      this.elements.push(element);
    }

    dequeue() {
      return this.elements.shift();
    }

    isEmpty() {
      return this.elements.length <= 0;
    }
  }

  // Create a queue of the filters.
  let filters = new Queue();

  async function download(URL) {
    let filter = await fetch(URL);

    // Return the filter.
    return filter;
  }

  if (URL) {
    // Check if the URL is in a valid protocol
    if (URL.includes(`://`)) {
      // Append that to the queue.
      filters.enqueue(URL);
    }
  } else {
    // Add every item to the queue based on what was loaded first.
    if ((await Promise.all([secretariat.read(`filters`, -1)]))[0]) {
      Object.keys(
        (await Promise.all([secretariat.read(`filters`, -1)]))[0],
      ).every((filter_URL) => {
        if (filter_URL.includes(`://`)) {
          filters.enqueue(filter_URL);
        }
      });
    }
  }

  while (!filters.isEmpty()) {
    let filter_URL = filters.dequeue();
    let filter = await net.download(filter_URL);

    // Write the filter to storage.
    secretariat.write(["filters", filter_URL], filter, -1);
  }
}
