/* processor.js 
Process the information on the website and display it on screen. 
*/

// const inject = ((await import(chrome.runtime.getURL("scripts/outside/inject.js"))).default);
const scraper = (await import(chrome.runtime.getURL("scripts/outside/scraper.js"))).default;

export default class processor {
     #filter; 

     async scrape (fields) {
          this.data = new scraper ((fields) ? fields : this.targets); 
          console.log(this.data);
     }
     
     constructor (filter) {
          this.#filter = filter;

          this.targets = this.#filter[`data`];
          this.scrape();
     }
}