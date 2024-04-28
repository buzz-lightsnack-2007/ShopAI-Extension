import Window from "/scripts/GUI/window.js";

export default class ManagedWindow {
	constructor () {
		this.instance = new Window("/pages/popup.htm", {"width": "500", "height": "500", "type": "popup", "hidden": true});
	}
	
	/*
	Show the popup. 
	*/
	show() {
		this.instance.show();
	}
}