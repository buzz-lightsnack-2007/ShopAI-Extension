import Sidebar from '../GUI/sidebar.js';
import {read, write} from '../secretariat.js';

export default class sidebar_handler {
     constructor () {

     };

     async activate () {
          await read(`settings,behavior,autoRun`)
     }
}