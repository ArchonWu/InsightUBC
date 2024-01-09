export interface JsonSection {
	id: number;
	Section: string;
	Subject: string;
	Course: string;
	Title: string;
	Professor: string;
	Year: string;
	Avg: number;
	Pass: number;
	Fail: number;
	Audit: number;
}

export interface SavedSection {
	uuid: string;
	id: string;
	title: string;
	instructor: string;
	dept: string;
	year: number;
	avg: number;
	pass: number;
	fail: number;
	audit: number;
}

export default class Section {
	private readonly uuid: string = "";
	private readonly id: string = "";
	private readonly title: string = "";
	private readonly instructor: string = "";
	private readonly dept: string = "";
	private readonly year: number = -1;
	private readonly avg: number = -1;
	private readonly pass: number = -1;
	private readonly fail: number = -1;
	private readonly audit: number = -1;

	// jsonObject: result[i]
	// savedSection: previously saved Section, in the format of SavedSection
	constructor(jsonData: JsonSection | SavedSection, type: string) {
		if (type === "JsonSection") {
			const jsonObject = jsonData as JsonSection;
			this.uuid = jsonObject.id.toString();
			this.id = jsonObject.Course;
			this.title = jsonObject.Title;
			this.instructor = jsonObject.Professor;
			this.dept = jsonObject.Subject;
			if (jsonObject.Section === "overall") {
				this.year = 1900;
			} else {
				this.year = parseFloat(jsonObject.Year);
			}
			this.avg = jsonObject.Avg;
			this.pass = jsonObject.Pass;
			this.fail = jsonObject.Fail;
			this.audit = jsonObject.Audit;
		} else if (type === "SavedSection") {
			const savedSection = jsonData as SavedSection;
			this.uuid = savedSection.uuid;
			this.id = savedSection.id;
			this.title = savedSection.title;
			this.instructor = savedSection.instructor;
			this.dept = savedSection.dept;
			this.year = savedSection.year;
			this.avg = savedSection.avg;
			this.pass = savedSection.pass;
			this.fail = savedSection.fail;
			this.audit = savedSection.audit;
		}
	}

	public getSectionColumnField(targetField: string): string | number {
		if (targetField === "uuid") {
			return this.getUuid();
		} else if (targetField === "id") {
			return this.getId();
		} else if (targetField === "title") {
			return this.getTitle();
		} else if (targetField === "instructor") {
			return this.getInstructor();
		} else if (targetField === "dept") {
			return this.getDepartment();
		} else if (targetField === "year") {
			return this.getYear();
		} else if (targetField === "avg") {
			return this.getAvg();
		} else if (targetField === "pass") {
			return this.getPass();
		} else if (targetField === "fail") {
			return this.getFail();
		} else if (targetField === "audit") {
			return this.getAudit();
		} else {
			throw new Error(`Invalid column: ${targetField} to get field`);
		}
	}

	public getUuid(): string {
		return this.uuid;
	}

	public getId(): string {
		return this.id;
	}

	public getTitle(): string {
		return this.title;
	}

	public getInstructor(): string {
		return this.instructor;
	}

	public getDepartment(): string {
		return this.dept;
	}

	public getYear(): number {
		return this.year;
	}

	public getAvg(): number {
		return this.avg;
	}

	public getPass(): number {
		return this.pass;
	}

	public getFail(): number {
		return this.fail;
	}

	public getAudit(): number {
		return this.audit;
	}
}
