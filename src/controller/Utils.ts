import Section from "./Section";
import Room from "./Room";

export function getStringBeforeUnderscore(str: string): string {
	return str.substring(0, str.lastIndexOf("_"));
}

export function getStringAfterUnderscore(str: string): string {
	return str.substring(str.lastIndexOf("_") + 1);
}

export function getDataFromDataKind(object: Section | Room, column: string): any {
	if (object instanceof Section) {
		return object.getSectionColumnField(getStringAfterUnderscore(column));
	} else {
		return object.getRoomColumnField(getStringAfterUnderscore(column));
	}
}
