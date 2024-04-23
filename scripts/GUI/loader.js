import texts from "/scripts/strings/read.js";

export default class Loader {
     /* Link a loading screen. 
     
     @param {float} progress the current progress
     */
     constructor(progress) {
          this.#element();
          this.#content();
          this.update(progress);
     }

     #element() {
          this.elements = {};
          (document.querySelector(`[for="loading"]`)) ? this.elements[`message`] = (document.querySelectorAll(`[for="loading"]`)) : null;
          (document.querySelector(`[data-value="progress"]`)) ? this.elements[`bar`] = (document.querySelectorAll(`[data-value="progress"]`)) : null;
     }

     #content() {
          if (this.elements[`message`] ? (this.elements[`message`].length > 0) : false) {
               let MESSAGE_LOADING = {};
               MESSAGE_LOADING[`index`] = Math.random() * (10**2);
               MESSAGE_LOADING[`index`] = parseInt(MESSAGE_LOADING[`index`] / ((MESSAGE_LOADING[`index`] > 10) ? 10 : 1));
               MESSAGE_LOADING[`message`] = (new texts(`message_loading_`.concat(MESSAGE_LOADING[`index`]))).localized;

               (this.elements[`message`]).forEach(ELEMENT => {
                    ELEMENT.textContent = MESSAGE_LOADING[`message`];
               });
		}
     }

     /* Update the status bar. 
     
     @param {float} progress the current progress
     */
     update(progress) {
          this.progress = (progress != null && (typeof progress).includes(`num`)) ? Math.abs(progress) : null;

          if (this.elements[`bar`] ? (this.elements[`bar`].length > 0) : false) {
               (this.elements[`bar`]).forEach(ELEMENT => {
                    if (ELEMENT.tagName.toLowerCase().includes(`progress`) || (ELEMENT.tagName.toLowerCase().includes(`input`) && ((ELEMENT.hasAttribute(`type`)) ? (ELEMENT.getAttribute(`type`).toLowerCase().includes(`range`)) : false))) {
                         ELEMENT.setAttribute(`value`, (this.progress / 100));
                         (!ELEMENT.hasAttribute(`min`)) ? ELEMENT.setAttribute(`min`, 0) : false;
                         (!ELEMENT.hasAttribute(`max`)) ? ELEMENT.setAttribute(`max`, 100) : false;
                    } else if (ELEMENT.tagName.toLowerCase().includes(`input`)) {
                         ELEMENT.setAttribute(`value`, this.progress);
                    } else if (ELEMENT.classList.contains(`progress`)) {
                         ELEMENT.querySelector(`*`).style.width = `${this.progress}%`;
                    } else {
                         ELEMENT.innerText = `${this.progress}%`;
                    }
               });
          }
     }
}