
import {Search} from "./search.js";
import {Tabs} from "./tabs.js";
import {NavigationBar} from "./navigation.js";

class UI {}
UI.search = Search;
UI.tabs = Tabs;
UI[`navigation bar`] = NavigationBar;

export {UI as default};