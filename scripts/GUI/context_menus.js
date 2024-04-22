/* context_menus.js */

export default class Menu {
     #options;

     constructor (ID, title, contexts, event, type, icon) {
          if ((typeof ID).includes(`obj`) && !Array.isArray(ID) && ID.hasOwnProperty(`ID`)) {
               (Object.keys(ID)).forEach((key) => {
                    this[key] = ID[key];
               })
          } else {
               this.ID = String((ID) ? ID : (Math.random() / Math.random() * 100));
               this.title = (title) ? title : `Menu`;
               this.contexts = (Array.isArray(contexts)) ? contexts : [`all`];
               this.event = (event) ? event : function() {};
               this.type = (((typeof type).includes(`str`) && type) ? type.trim() : false) ? type : `normal`;

               if (icon) {
                    this.icon = icon;
               };
          };

          this.#options = {
               id: this.ID,
               title: this.title,
               contexts: this.contexts,
               type: this.type,
               onclick: this.event
          };
          (this.icon) ? this.#options.icon = this.icon : null;

          chrome.contextMenus.create(this.#options);
          delete this.#options.id;
     };

     remove() {
          chrome.contextMenus.remove(this.ID);
     };

     /* Update the context menu. 
     
     @param {Object} options The new options for the context menu.
     */
     update(options) {
          if ((typeof options).includes(`obj`) && options != null && !Array.isArray(options)) {
               (Object.keys(options)).forEach((key) => {
                    (options[key] != null && options[key] != undefined) ? this[key] = options[key] : delete this[key];
               });
          }

          this.#options = {
               title: this.title,
               contexts: this.contexts,
               type: this.type,
               onclick: this.event
          };
          (this.icon) ? this.#options.icon = this.icon : null;

          chrome.contextMenus.update(this.ID, this.#options);
     }

     /* Run a new function when triggered. */
     onclick(callback) {
          this.event = callback;
          this.update();
     }
}