import Sidebar from '../GUI/sidebar.js';
import {global} from '../secretariat.js';

class sidebar_handler extends Page {
     constructor () {
          super();
     }

     async activate () {
          await global.read(`settings,behavior,autoRun`)
     }
}