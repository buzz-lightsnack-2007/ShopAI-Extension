import Window from "/scripts/GUI/window.js";
import BrowserIcon from '/scripts/GUI/extensionIcon.js';

export default class ManagedWindow {
	constructor () {
		this.instance = new Window("/pages/popup.htm", null, {"width": "120", "height": "200", "hidden": true});
	}
	
	/*
	Show the popup. 
	*/
	show() {
		this.instance.show();
	}
}