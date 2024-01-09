import Section from "./Section";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import Room from "./Room";

export default class Dataset {
	private dataList: Section[] | Room[] = [];
	private readonly datasetKind: InsightDatasetKind = InsightDatasetKind.Sections;

	constructor(kind: InsightDatasetKind) {
		this.datasetKind = kind;
	}

	public getDatasetKind(): InsightDatasetKind {
		return this.datasetKind;
	}

	public addDatasetData(dataList: Section[] | Room[], queryingDatasetKind: InsightDatasetKind | undefined) {
		if (queryingDatasetKind === undefined) {
			throw new Error("undefined InsightDatasetKind");
		}
		if (queryingDatasetKind === InsightDatasetKind.Sections) {
			this.addDatasetSections(dataList as Section[]);
		} else if (queryingDatasetKind === InsightDatasetKind.Rooms) {
			this.addDatasetRooms(dataList as Room[]);
		}
	}

	private addDatasetSections(sections: Section[]): void {
		this.dataList = (this.dataList as Section[]).concat(sections);
	}

	public addDatasetRooms(rooms: Room[]): void {
		this.dataList = (this.dataList as Room[]).concat(rooms);
		// this.dataList = Array.from(new Set(this.dataList));		// this is just a work around
	}

	public getDatasetLength(): number {
		return this.dataList.length;
	}

	public getAllDataInDataList(): Section[] | Room[] {
		if (this.datasetKind === InsightDatasetKind.Sections) {
			return this.getAllSections();
		} else if (this.datasetKind === InsightDatasetKind.Rooms) {
			return this.getAllRooms();
		}
		throw Error(`Error getting dataList; kind: ${this.datasetKind}`);
	}

	private getAllRooms(): Room[] {
		return this.dataList as Room[];
	}

	private getAllSections(): Section[] {
		return this.dataList as Section[];
	}

	public getDataKindListsWithCondition
	(dataKindList: Section[] | Room[], comparator: string, targetField: string, targetValue: string | number):
		Section[] | Room[] {
		if (typeof targetValue === "string") {
			if (this.datasetKind === InsightDatasetKind.Sections) {
				return this.getSectionsWildcardString(dataKindList as Section[], targetField, targetValue as string);
			} else {
				return this.getRoomsWildcardString(dataKindList as Room[], targetField, targetValue as string);
			}
		} else {
			if (this.datasetKind === InsightDatasetKind.Sections) {
				return this.getSectionsWithConditionNumber(dataKindList as Section[],
					comparator, targetField, targetValue);
			} else {
				return this.getDataRoomsWithConditionNumber(dataKindList as Room[],
					comparator, targetField, targetValue);
			}
		}
	}

	private getSectionsWithConditionNumber
	(sections: Section[], comparator: string, targetField: string, targetValue: string | number): Section[] {
		if (targetField === "year") {
			return this.getSectionsWithYear(sections, targetValue as number, comparator);
		} else if (targetField === "avg") {
			return this.getSectionsWithAvg(sections, targetValue as number, comparator);
		} else if (targetField === "pass") {
			return this.getSectionsWithPass(sections, targetValue as number, comparator);
		} else if (targetField === "fail") {
			return this.getSectionsWithFail(sections, targetValue as number, comparator);
		} else if (targetField === "audit") {
			return this.getSectionsWithAudit(sections, targetValue as number, comparator);
		} else {
			throw new InsightError(`ERROR in getSectionsWithCondition(); ${targetField}, ${targetValue}`);
		}
	}

	private getDataRoomsWithConditionNumber
	(rooms: Room[], comparator: string, targetField: string, targetValue: string | number): Room[] {
		if (targetField === "lat") {
			return this.getRoomsWithLat(rooms, targetValue as number, comparator);
		} else if (targetField === "lon") {
			return this.getRoomsWithLon(rooms, targetValue as number, comparator);
		} else if (targetField === "seats") {
			return this.getRoomsWithSeats(rooms, targetValue as number, comparator);
		}
		return rooms;
	}

	private getRoomsWithLat(rooms: Room[], targetLat: number, comparator: string): Room[] {
		if (comparator === "EQ") {
			return rooms.filter((room) => room.getLat() === targetLat);
		} else if (comparator === "GT") {
			return rooms.filter((room) => room.getLat() > targetLat);
		} else if (comparator === "LT") {
			return rooms.filter((room) => room.getLat() < targetLat);
		} else {
			throw new InsightError("INVALID COMPARATOR IN ROOMS GET");
		}
	}

	private getRoomsWithLon(rooms: Room[], targetLon: number, comparator: string): Room[] {
		if (comparator === "EQ") {
			return rooms.filter((room) => room.getLon() === targetLon);
		} else if (comparator === "GT") {
			return rooms.filter((room) => room.getLon() > targetLon);
		} else if (comparator === "LT") {
			return rooms.filter((room) => room.getLon() < targetLon);
		} else {
			throw new InsightError("INVALID COMPARATOR IN ROOMS GET");
		}
	}

	private getRoomsWithSeats(rooms: Room[], targetSeats: number, comparator: string): Room[] {
		if (comparator === "EQ") {
			return rooms.filter((room) => room.getSeats() === targetSeats);
		} else if (comparator === "GT") {
			return rooms.filter((room) => room.getSeats() > targetSeats);
		} else if (comparator === "LT") {
			return rooms.filter((room) => room.getSeats() < targetSeats);
		} else {
			throw new InsightError("INVALID COMPARATOR IN ROOMS GET");
		}
	}

	private getRoomsWildcardString(rooms: Room[], targetField: string, targetValue: string): Room[] {
		if (targetValue.startsWith("*") && targetValue.endsWith("*")) {
			const wildcardValue = targetValue.slice(1, -1); // remove start and end asterisks (ChatGPT)
			return rooms.filter((room) =>
				(room.getRoomColumnField(targetField) as string).includes(wildcardValue));
		} else if (targetValue.startsWith("*")) {
			const wildcardValue = targetValue.slice(1); 		// remove start asterisk
			return rooms.filter((room) =>
				(room.getRoomColumnField(targetField) as string).endsWith(wildcardValue));
		} else if (targetValue.endsWith("*")) {
			const wildcardValue = targetValue.slice(0, -1); // remove end asterisk
			return rooms.filter((room) =>
				(room.getRoomColumnField(targetField) as string).startsWith(wildcardValue));
		} else {													// no wildcard
			return rooms.filter((room) => room.getRoomColumnField(targetField) === targetValue);
		}
	}

	private getSectionsWildcardString(sections: Section[], targetField: string, targetValue: string): Section[] {
		if (targetValue.startsWith("*") && targetValue.endsWith("*")) {
			const wildcardValue = targetValue.slice(1, -1); // remove start and end asterisks (ChatGPT)
			return sections.filter((section) =>
				(section.getSectionColumnField(targetField) as string).includes(wildcardValue));
		} else if (targetValue.startsWith("*")) {
			const wildcardValue = targetValue.slice(1); 		// remove start asterisk
			return sections.filter((section) =>
				(section.getSectionColumnField(targetField) as string).endsWith(wildcardValue));
		} else if (targetValue.endsWith("*")) {
			const wildcardValue = targetValue.slice(0, -1); // remove end asterisk
			return sections.filter((section) =>
				(section.getSectionColumnField(targetField) as string).startsWith(wildcardValue));
		} else {													// no wildcard
			return sections.filter((section) => section.getSectionColumnField(targetField) === targetValue);
		}
	}

	// get all sections with year number
	private getSectionsWithYear(sections: Section[], year_number: number, comparator: string): Section[] {
		if (comparator === "EQ") {
			return sections.filter((section) => section.getYear() === year_number);
		} else if (comparator === "GT") {
			return sections.filter((section) => section.getYear() > year_number);
		} else if (comparator === "LT") {
			return sections.filter((section) => section.getYear() < year_number);
		} else {
			throw new InsightError("INVALID COMPARATOR IN SECTIONS GET");
		}
	}

	// get all sections with average number
	private getSectionsWithAvg(sections: Section[], avg_number: number, comparator: string): Section[] {
		if (comparator === "EQ") {
			return sections.filter((section) => section.getAvg() === avg_number);
		} else if (comparator === "GT") {
			return sections.filter((section) => section.getAvg() > avg_number);
		} else if (comparator === "LT") {
			return sections.filter((section) => section.getAvg() < avg_number);
		} else {
			throw new InsightError("INVALID COMPARATOR IN SECTIONS GET");
		}
	}

	// get all sections with pass number
	private getSectionsWithPass(sections: Section[], pass_number: number, comparator: string): Section[] {
		if (comparator === "EQ") {
			return sections.filter((section) => section.getPass() === pass_number);
		} else if (comparator === "GT") {
			return sections.filter((section) => section.getPass() > pass_number);
		} else if (comparator === "LT") {
			return sections.filter((section) => section.getPass() < pass_number);
		} else {
			throw new InsightError("INVALID COMPARATOR IN SECTIONS GET");
		}
	}

	// get all sections with fail number
	private getSectionsWithFail(sections: Section[], fail_number: number, comparator: string): Section[] {
		if (comparator === "EQ") {
			return sections.filter((section) => section.getFail() === fail_number);
		} else if (comparator === "GT") {
			return sections.filter((section) => section.getFail() > fail_number);
		} else if (comparator === "LT") {
			return sections.filter((section) => section.getFail() < fail_number);
		} else {
			throw new InsightError("INVALID COMPARATOR IN SECTIONS GET");
		}
	}

	// get all sections with audit number
	private getSectionsWithAudit(sections: Section[], audit_number: number, comparator: string): Section[] {
		if (comparator === "EQ") {
			return sections.filter((section) => section.getAudit() === audit_number);
		} else if (comparator === "GT") {
			return sections.filter((section) => section.getAudit() > audit_number);
		} else if (comparator === "LT") {
			return sections.filter((section) => section.getAudit() < audit_number);
		} else {
			throw new InsightError("INVALID COMPARATOR IN SECTIONS GET");
		}
	}
}


