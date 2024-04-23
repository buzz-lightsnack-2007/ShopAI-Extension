import Tabs from "/scripts/GUI/tabs.js";
import Entry from "/scripts/external/entry.js"

export default class Watcher_Tabs {
     constructor () {
          Tabs.addActionListener(`update`, this.check);
     };

     check(data) {
          if ((data.tab) ? data.tab.url : false) {
               Entry.manage(data.tab);
          }
     }
}