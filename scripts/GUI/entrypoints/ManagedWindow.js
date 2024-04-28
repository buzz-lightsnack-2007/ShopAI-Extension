import Window from "/scripts/GUI/window.js";

export default class ManagedWindow {
	constructor () {
		this.instance = new Window("/pages/popup.htm", {"width": "120", "height": "200", "type": "popup", "hidden": true});
	}
	
	/*
	Show the popup. 
	*/
	show() {
		this.instance.show();
	}
}