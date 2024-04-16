/* page.js 
Construct an internal page. 
*/

import windowman from "/scripts/GUI/windowman.js";

export default class Page {
     constructor () {
          this.window = window;

          this.window[`manager`] = new windowman();
          (this.window[`manager`]) ? this.window.manager.sync() : false;

		document.addEventListener("DOMContentLoaded", function () {
			M.AutoInit();
		});
     }
};