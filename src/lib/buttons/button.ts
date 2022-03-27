// Commonalities among all types of buttons

export default class Button {
	constructor() {}
	setOnClick(f) {}
	setOnHover(hoverCallback, exitCallback) {} // TODO It might be that each subtype handles this in their own way
	// For example, maybe the map nodes 'dance' or until exited, but this function doesnt need to be exposed

	enable() {}
	disable() {}

	highlight() {}
}