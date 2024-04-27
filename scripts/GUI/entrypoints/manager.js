// Manage all entries. 

import Tabs from "/scripts/GUI/tabs.js";
import Window from "/scripts/GUI/window.js";
import MenuEntry from "./menu.js";
import ManagedPopup from "./popup.js";
import IconIndicator from "./icons.js";
import check from "/scripts/external/check.js";
import {read} from "/scripts/secretariat.js";

export default class EntryManager {
     constructor () {
          // Initialize the entries. 
          this.instances = {};
          this.instances.popup = new ManagedPopup();
          this.instances.menu = new MenuEntry();

          // Add the action listeners.
          this.#listen();
     }

     /* Add the action listeners when running this. */
     #listen() {
          Tabs.addActionListener(`onActivated`, (data) => {this.onRefresh()});
          Tabs.addActionListener(`onUpdated`, (data) => {this.onRefresh()});
          Window.addActionListener(`onFocusChanged`, (data) => {this.onRefresh()});
     }

     onRefresh() {
          (Tabs.query(null, 0)).then((DATA) => {
               if (DATA ? (DATA.url) : false) {
                    (check.platform(DATA.url)).then((result) => {
                         (result) ? (this.enable()) : (this.disable())
                    });
               };
          })
     }

     /* 
     Enable the entries. 
     */
     enable () {
          this.instances.menu.enable();
          IconIndicator.enable();
          this.instances.popup.enable();
     }

     /* 
     Disable the entries and the existing opened side panel. 
     */
     disable () {
          this.instances.menu.disable();
          this.instances.popup.disable();
          IconIndicator.disable();
     }
}