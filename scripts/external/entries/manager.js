// Manage all entries. 

import {read} from '../../secretariat.js';
import Tabs from "/scripts/GUI/tabs.js";
import MenuEntry from "./menu.js";
import ManagedSidebar from "./sidebar.js";
import IconIndicator from "./icons.js";
import filters from '../../filters.js';

export default class EntryManager {
     constructor () {
          this.instances = {};
          this.instances.menu = new MenuEntry();
          Tabs.addActionListener(`onActivated`, (data) => {this.check()});
     }

     async check() {
          const DATA = await Tabs.query(null, 0)

          if (DATA.url) {
               (!!await ((new filters).select(DATA.url)))
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

          // Open the side panel, if supported. 
		read([`settings`,`behavior`,`autoOpen`]).then((result) => {
			result = (result == null) ? false : result;
			if (result) {
				new ManagedSidebar();
			}
		});
     }

     /* 
     Disable the entries and the existing opened side panel. 
     */
     disable () {
          this.instances.menu.disable();
          IconIndicator.disable();
     }
}