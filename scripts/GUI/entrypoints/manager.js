// Manage all entries. 

import Tabs from "/scripts/GUI/tabs.js";
import Window from "/scripts/GUI/window.js";
import MenuEntry from "./menu.js";
import ManagedSidebar from "./sidebar.js";
import IconIndicator from "./icons.js";
import check from "/scripts/external/check.js";

export default class EntryManager {
     constructor () {
          // Initialize the entries. 
          this.instances = {};
          this.instances.menu = new MenuEntry();
          
          // Initialize the managed sidebar to be called. 
          ManagedSidebar.manage();

          // Add the action listeners.
          this.#listen();
     }

     /* Add the action listeners when running this. */
     #listen() {
          Tabs.addActionListener(`onActivated`, (data) => {this.onRefresh()});
          Tabs.addActionListener(`onUpdated`, (data) => {this.onRefresh()});
          Window.addActionListener(`onFocusChanged`, (data) => {this.onRefresh()});
     }

     async onRefresh() {
          const DATA = await Tabs.query(null, 0)

          if (DATA.url) {
               (!!await check.platform(DATA.url))
                    ? (this.enable())
                    : (this.disable())
          };
     }

     /* 
     Enable the entries. 
     */
     enable () {
          this.instances.menu.enable();
          IconIndicator.enable();
     }

     /* 
     Disable the entries and the existing opened side panel. 
     */
     disable () {
          this.instances.menu.disable();
          IconIndicator.disable();
     }
}