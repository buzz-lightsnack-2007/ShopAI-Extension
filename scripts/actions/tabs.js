import Tabs from "/scripts/GUI/tabs.js";
import Entry_Manager from "/scripts/external/entries/manager.js"

export default class Watcher_Tabs {
     constructor () {
          new Entry_Manager();
          Tabs.addActionListener(`update`, this.check);
     };

     check(data) {
     }
}