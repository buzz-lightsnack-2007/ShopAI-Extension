/* different from windowman.js, just creates window management. */

export default class Window {
     #features;

     constructor(url, name, options) {
          this.url = url;
          this.name = name; 

          if ((typeof options).includes(`obj`)) {
               this.options = options;
               this.#features = ``;

               let FEATURES = Object.keys(options);
               for (let i = 0; i < FEATURES.length; i++) {
                    this.#features = this.#features.concat(`${FEATURES[i]}=${options[FEATURES[i]]}`).concat((i == Object.keys(options).length - 1) ? `` : `,`);
               }
          }

          this.options = options;

          this.show();
     }

     show() {
          this.window = window.open(this.url, this.name, this.options);
     };

     /* Create an action listener. 

     @param {string} event the event to listen for
     @param {function} callback the callback function
     */
     static addActionListener(event, callback) {
          // Correct possible syntax error on "on" prefix.
          event = (!event.includes(`on`)) ? `on${event}` : event;

          // Add the event. 
          chrome.windows[event].addListener(callback);
     }
};