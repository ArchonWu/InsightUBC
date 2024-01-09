import Room from "./Room";

export class BuildingHtmProcessor {
	private roomsNumbers: string[] = [];
	private roomsNames: string[] = [];
	private roomsSeats: number[] = [];
	private roomsTypes: string[] = [];
	private roomsFurniture: string[] = [];
	private roomsHrefs: string[] = [];

	private extractInformationFromDiv(node: any) {
		if (node.tagName === "table") {
			if (node.childNodes) {
				for (const childNode of node.childNodes) {
					if (childNode.tagName === "tbody") {
						this.extractInformationFromTBody(childNode);
					}
				}
			}
		} else if (node.childNodes) {		// look for <div> or <tbody> from childNodes
			for (const childNode of node.childNodes) {
				this.extractInformationFromDiv(childNode);
			}
		}
	}

    // already found <td>, look for <a>
	private extractInformationFromTd(node: any) {
		if (node.attrs && node.attrs[0] && node.attrs[0].value
			&& node.attrs[0].value === "views-field views-field-field-room-furniture") {
			if (node.childNodes && node.childNodes[0] && node.childNodes[0].value) {
				const roomFurniture = node.childNodes[0].value.trim();
				this.roomsFurniture.push(roomFurniture);
			}
		}

		if (node.attrs && node.attrs[0] && node.attrs[0].value
			&& node.attrs[0].value === "views-field views-field-field-room-capacity") {
			if (node.childNodes && node.childNodes[0] && node.childNodes[0].value) {
				const roomSeats = parseInt(node.childNodes[0].value.trim(), 10);
				this.roomsSeats.push(roomSeats);
			}
		}

		if (node.attrs && node.attrs[0] && node.attrs[0].value
			&& node.attrs[0].value === "views-field views-field-field-room-type") {
			if (node.childNodes && node.childNodes[0] && node.childNodes[0].value) {
				const roomType = node.childNodes[0].value.trim();
				if (roomType.length === 0) {
					this.roomsTypes.push("");
				} else {
					this.roomsTypes.push(roomType);
				}
			}
		}

		if (node.childNodes) {
			for (const childNode of node.childNodes) {
				if (childNode.tagName === "a") {
					this.extractInformationFromA(childNode);
				}
			}
		}
	}

	private extractInformationFromA(node: any) {
		if (node.tagName === "a" && node.attrs
			&& node.attrs[0] && node.attrs[0].name && node.attrs[0].name === "href"
			&& node.attrs[1] && node.attrs[1].value && node.attrs[1].value === "Room Details") {
			const roomHref = node.attrs[0].value;
			this.roomsHrefs.push(roomHref);
			let roomName = roomHref.substring(roomHref.lastIndexOf("/") + 1);
			this.roomsNames.push(roomName);
		}

		if (node.tagName === "a" && node.parentNode.attrs && node.parentNode.attrs[0]
            && node.parentNode.attrs[0].value === "views-field views-field-field-room-number") {
			if (node.childNodes && node.childNodes[0]) {
				const roomNumber = node.childNodes[0].value;
				this.roomsNumbers.push(roomNumber);
			}
		}
	}

    // already found <tr>, look for <td>
	private extractInformationFromTr(node: any) {
		if (node.childNodes) {
			for (const childNode of node.childNodes) {
				if (childNode.tagName === "td") {
					this.extractInformationFromTd(childNode);
				}
			}
		}
	}

    // already found <tbody>, look for <tr>
	private extractInformationFromTBody(node: any) {
		if (node.childNodes) {
			for (const childNode of node.childNodes) {
				if (childNode.tagName === "tr") {
					this.extractInformationFromTr(childNode);
				}
			}
		}
	}

    // find <div> or <tbody>
	public extractRoomsFromBuilding(node: any) {
		if (node.tagName === "div") {
			this.extractInformationFromDiv(node);
		} else if (node.childNodes) {		// look for <div> or <tbody> from childNodes
			for (const childNode of node.childNodes) {
				this.extractRoomsFromBuilding(childNode);
			}
		}
	}

	public parseRooms(): Room[] {
		const buildingRooms: Room[] = [];
		for (const i in this.roomsNames) {
			if (this.roomsNumbers[i] &&
				(this.roomsNames[i] || this.roomsNames[i] === "")
				&& this.roomsSeats[i]
				&& (this.roomsTypes[i] || this.roomsTypes[i] === "")
				&& (this.roomsFurniture[i] || this.roomsFurniture[i] === "")
				&& this.roomsHrefs[i]) {
				const room = new Room(null, this.roomsNumbers[i], this.roomsNames[i], this.roomsSeats[i],
					this.roomsTypes[i],	this.roomsFurniture[i],	this.roomsHrefs[i]);
				buildingRooms.push(room);
			}
		}
		return buildingRooms;
	}


}
