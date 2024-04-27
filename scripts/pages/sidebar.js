import Sidebar from '../GUI/sidebar.js';
import {read, write} from '../secretariat.js';

class sidebar_handler extends Page {
     constructor () {
          super();
     }

     async activate () {
          await read(`settings,behavior,autoRun`)
     }
}