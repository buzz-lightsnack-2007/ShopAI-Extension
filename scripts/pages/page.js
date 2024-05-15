/* page.js 
Construct an internal page. 
*/

import windowman from "/scripts/GUI/builder/windowman.js";

export default class Page {
     constructor () {
          this.window = window;
          this.window[`manager`] = new windowman();
          
          // Link the elements from this.window.manager to this.window for convenience later on. 
          if ((this.window[`manager`])) {
               this.window.manager.sync();

               Object.assign(this.window, this.window[`manager`]);
          }

		document.addEventListener("DOMContentLoaded", function () {
			M.AutoInit();
		});
     }
};