import {
	IInsightFacade, InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;
	let shortSections: string = getContentFromArchives("pair-smaller-add-delete.zip");
	let shortRooms: string = getContentFromArchives("campus_ALRD.zip");
	let rooms: string = getContentFromArchives("campus.zip");
	let sections: string = getContentFromArchives("pair.zip");

	before(function () {
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			console.info(`AfterTest: ${this.currentTest?.title}`);
			// clearDisk();
		});

		it("should reject with  an empty dataset id", function () {
			const result = facade.addDataset("", shortSections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});

	describe("addDataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			// clearDisk();
		});

		it("should successfully add 2 datasets", async function () {
			let zipFolder1 = getContentFromArchives("one_LAW377.zip");
			const zipFolder2 = getContentFromArchives("campus_ALRD.zip");
			const result1 = await facade.addDataset("ubc", zipFolder1, InsightDatasetKind.Sections);
			try {
				await facade.addDataset("ubc", zipFolder2, InsightDatasetKind.Rooms);
			} catch (error) {
				// expected
			}
			const result3 = await facade.addDataset("ubc0", zipFolder1, InsightDatasetKind.Sections);
			return expect(result3).to.have.deep.members(["ubc", "ubc0"]);
		});

		it("should successfully add a dataset with only one course", function () {
			let zipFolder = getContentFromArchives("one_LAW377.zip");
			const result = facade.addDataset("ubc", zipFolder, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.members(["ubc"]);
		});

		it("should fail to add dataset due to not having any valid course/section", function () {
			// has file but no valid section
			let zipFolder = getContentFromArchives("one_empty_results_course.zip");
			const result = facade.addDataset("ubc", zipFolder, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should successfully add a dataset (first)", function () {
			const result = facade.addDataset("ubc", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members(["ubc"]);
		});

		it("should successfully add a dataset (second)", function () {
			const result = facade.addDataset("ubc", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members(["ubc"]);
		});

		it("should successfully add a dataset (one char)", function () {
			const result = facade.addDataset("u", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members(["u"]);
		});

		it("should successfully add a dataset (one asterisk)", function () {
			const result = facade.addDataset("*", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members(["*"]);
		});

		it("should successfully add a dataset (interesting characters)", function () {
			const result = facade.addDataset("!@#$%^&*()", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members(["!@#$%^&*()"]);
		});

		it("should successfully add a dataset (only numbers)", function () {
			const result = facade.addDataset("0987654321", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members(["0987654321"]);
		});

		it("should successfully add a dataset (mixed)", function () {
			const result = facade.addDataset("!@#$%^&*()abcdefg0987654321", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members(["!@#$%^&*()abcdefg0987654321"]);
		});

		it("should successfully add two datasets", async function () {
			await facade.addDataset("ubc1", shortSections, InsightDatasetKind.Sections);
			const result = facade.addDataset("ubc2", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members(["ubc1", "ubc2"]);
		});

		it("should successfully add a dataset (mixed whitespace)", function () {
			const result = facade.addDataset("U B C", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members(["U B C"]);
		});

		it("should successfully add a dataset (leading whitespace)", function () {
			const result = facade.addDataset(" UBC", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members([" UBC"]);
		});

		it("should successfully add a dataset (trailing whitespace)", function () {
			const result = facade.addDataset("UBC ", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members(["UBC "]);
		});

		it("should successfully add a dataset (capital letters)", function () {
			const result = facade.addDataset("UBC", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.have.members(["UBC"]);
		});


		it("should reject with an invalid dataset id (empty)", function () {
			const result = facade.addDataset("", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an invalid dataset id (underscore)", function () {
			const result = facade.addDataset("o_O", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an invalid dataset id (only underscores)", function () {
			const result = facade.addDataset("___", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an invalid dataset id (whitespaces)", function () {
			const result = facade.addDataset("   ", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an invalid dataset id (duplicate)", async function () {
			await facade.addDataset("ubc", shortSections, InsightDatasetKind.Sections);
			const result = facade.addDataset("ubc", shortSections, InsightDatasetKind.Sections);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an invalid dataset (non-zip)", async function () {
			let invalidDataset = getContentFromArchives("test-dataset.txt");
			const result = facade.addDataset("ubc", invalidDataset, InsightDatasetKind.Sections);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an invalid dataset (no valid course)", async function () {
			let invalidDataset = getContentFromArchives("pair-invalid-dataset-no-valid-course.zip");
			const result = facade.addDataset("ubc", invalidDataset, InsightDatasetKind.Sections);

			// console.log(invalidDataset);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});

	describe("removeDataset", function () {
		before(function () {
			// sections = getContentFromArchives("pair.zip");
			// rooms = getContentFromArchives("campus.zip");
			// shortSections = getContentFromArchives("pair-smaller-add-delete.zip");
			// shortRooms = getContentFromArchives("campus_ALRD.zip");
		});

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("should list no dataset (1 sections)", async function () {
			await facade.addDataset("sections", shortSections, InsightDatasetKind.Sections);
			await facade.removeDataset("sections");
			const datasets = await facade.listDatasets();

			expect(datasets).to.deep.equal([]);
		});

		it("should list no dataset (1 rooms)", async function () {
			await facade.addDataset("rooms", shortRooms, InsightDatasetKind.Rooms);
			await facade.removeDataset("rooms");
			const datasets = await facade.listDatasets();

			expect(datasets).to.deep.equal([]);
		});

		it("should list no dataset (1 sections, 1 rooms)", async function () {
			await facade.addDataset("sections", shortSections, InsightDatasetKind.Sections);
			await facade.addDataset("rooms", shortRooms, InsightDatasetKind.Rooms);
			await facade.removeDataset("sections");
			await facade.removeDataset("rooms");
			const datasets = await facade.listDatasets();

			expect(datasets).to.deep.equal([]);
		});

		it("should list 1 section dataset (2 sections)", async function () {
			await facade.addDataset("section", shortSections, InsightDatasetKind.Sections);
			await facade.addDataset("section1", shortSections, InsightDatasetKind.Sections);
			await facade.removeDataset("section");
			const datasets = await facade.listDatasets();

			expect(datasets).to.deep.equal([{
				id: "section1",
				kind: InsightDatasetKind.Sections,
				numRows: 2
			}]);
		});

		it("should list 1 room dataset (2 rooms)", async function () {
			await facade.addDataset("rooms", shortRooms, InsightDatasetKind.Rooms);
			await facade.addDataset("rooms1", shortRooms, InsightDatasetKind.Rooms);
			await facade.removeDataset("rooms");
			const datasets = await facade.listDatasets();

			expect(datasets).to.deep.equal([{
				id: "rooms1",
				kind: InsightDatasetKind.Rooms,
				numRows: 5
			}]);
		});
	});

	describe("listDataset", function () {
		before(function () {
			sections = getContentFromArchives("pair.zip");
			rooms = getContentFromArchives("campus.zip");
			shortSections = getContentFromArchives("pair-smaller-add-delete.zip");
			shortRooms = getContentFromArchives("campus_ALRD.zip");
		});

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("should list no dataset", async function () {
			const datasets = await facade.listDatasets();

			expect(datasets).to.deep.equal([] as InsightDataset[]);
		});

		it("should list one short section dataset", async function () {
			this.timeout(5000);
			await facade.addDataset("ubc", shortSections, InsightDatasetKind.Sections);
			const datasets = await facade.listDatasets();

			expect(datasets).have.deep.members([{
				id: "ubc",
				kind: InsightDatasetKind.Sections,
				numRows: 2
			}] as InsightDataset[]);
		});

		it("should list one short room dataset", async function () {
			this.timeout(5000);
			await facade.addDataset("rooms", shortRooms, InsightDatasetKind.Rooms);
			const datasets = await facade.listDatasets();

			expect(datasets).have.deep.members([{
				id: "rooms",
				kind: InsightDatasetKind.Rooms,
				numRows: 5
			}] as InsightDataset[]);
		});

		it("should list one room dataset", async function () {
			this.timeout(5000);
			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			const datasets = await facade.listDatasets();

			expect(datasets).have.deep.members([{
				id: "rooms",
				kind: InsightDatasetKind.Rooms,
				numRows: 364
			}] as InsightDataset[]);
		});

		it("should list two sections datasets", async function () {
			this.timeout(5000);
			await facade.addDataset("ubc1", shortSections, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", shortSections, InsightDatasetKind.Sections);
			const datasets = await facade.listDatasets();
			const expected: InsightDataset[] = [{
				id: "ubc1",
				kind: InsightDatasetKind.Sections,
				numRows: 2
			} as InsightDataset,
				{
					id: "ubc2",
					kind: InsightDatasetKind.Sections,
					numRows: 2
				} as InsightDataset] as InsightDataset[];
			return expect(datasets).have.deep.members(expected);
		});

		it("should list three datasets", async function () {
			this.timeout(5000);
			await facade.addDataset("ubc1", shortSections, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", shortRooms, InsightDatasetKind.Rooms);
			await facade.addDataset("ubc3", shortRooms, InsightDatasetKind.Rooms);
			const datasets = await facade.listDatasets();
			const expected: InsightDataset[] = [{
				id: "ubc1",
				kind: InsightDatasetKind.Sections,
				numRows: 2
			} as InsightDataset,
				{
					id: "ubc2",
					kind: InsightDatasetKind.Rooms,
					numRows: 5
				} as InsightDataset,{
					id: "ubc3",
					kind: InsightDatasetKind.Rooms,
					numRows: 5
				} as InsightDataset] as InsightDataset[];
			return expect(datasets).have.deep.members(expected);
		});
	});

	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
			this.timeout(10000);
			facade = new InsightFacade();
			sections = getContentFromArchives("pair.zip");
			rooms = getContentFromArchives("campus.zip");

			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
				facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms)
			];

			return Promise.all(loadDatasetPromises);
		});
		after(function () {
			clearDisk();
			console.info(`After: ${this.test?.parent?.title}`);
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		describe("PerformQuery Rooms Queries", () => {
			before(async function () {
				console.info(`Before: ${this.test?.parent?.title}`);
			});
			after(function () {
				console.info(`After: ${this.test?.parent?.title}`);
			});

			folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
				"PerformQuery Rooms Queries",
				(input) => {
					this.timeout(10000);
					return facade.performQuery(input);
				},
				"./test/resources/queriesRooms",
				{
					assertOnResult: async (actual, expected) => {
						expect(actual).to.have.deep.members(await expected);
					},
					errorValidator: (error): error is PQErrorKind =>
						error === "ResultTooLargeError" || error === "InsightError",
					assertOnError: (actual, expected) => {
						if (expected === "InsightError") {
							expect(actual).to.be.instanceof(InsightError);
						} else if (expected === "ResultTooLargeError") {
							expect(actual).to.be.instanceof(ResultTooLargeError);
						} else {
							// this should be unreachable
							expect.fail("UNEXPECTED ERROR");
						}
					},
				}
			);
		});

		describe("Aggregation Tests for Sections Perform Query", () => {
			before(async function () {
				console.info(`Before: ${this.test?.parent?.title}`);
			});
			after(function () {
				console.info(`After: ${this.test?.parent?.title}`);
			});

			folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
				"Aggregation Tests for Sections Perform Query",
				(input) => facade.performQuery(input),
				"./test/resources/queryTransformations",
				{
					assertOnResult: async (actual, expected) => {
						expect(actual).to.have.deep.members(await expected);
					},
					errorValidator: (error): error is PQErrorKind =>
						error === "ResultTooLargeError" || error === "InsightError",
					assertOnError: (actual, expected) => {
						// console.log("Error Message: ", actual);
						if (expected === "InsightError") {
							expect(actual).to.be.instanceof(InsightError);
						} else if (expected === "ResultTooLargeError") {
							expect(actual).to.be.instanceof(ResultTooLargeError);
						} else {
							// this should be unreachable
							expect.fail("UNEXPECTED ERROR");
						}
					},
				}
			);
		});

		describe("PerformQuery tests Section Queries", () => {
			before(async function () {
				console.info(`Before: ${this.test?.parent?.title}`);
			});
			after(function () {
				console.info(`After: ${this.test?.parent?.title}`);
			});
			// No order tests
			folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
				"PerformQuery tests (No order)",
				(input) => facade.performQuery(input),
				"./test/resources/queries",
				{
					assertOnResult: async (actual, expected) => {
						expect(actual).to.have.deep.members(await expected);
					},
					errorValidator: (error): error is PQErrorKind =>
						error === "ResultTooLargeError" || error === "InsightError",
					assertOnError: (actual, expected) => {
						if (expected === "InsightError") {
							expect(actual).to.be.instanceof(InsightError);
						} else if (expected === "ResultTooLargeError") {
							expect(actual).to.be.instanceof(ResultTooLargeError);
						} else {
							// this should be unreachable
							expect.fail("UNEXPECTED ERROR");
						}
					},
				}
			);
		});

		describe("PerformQuery with ordering / sorting tests", () => {
			before(async function () {
				console.info(`Before: ${this.test?.parent?.title}`);
			});
			after(function () {
				console.info(`After: ${this.test?.parent?.title}`);
			});
			// have order test
			folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
				"PerformQuery with ordering / sorting tests",
				(input) => {
					this.timeout(10000);
					return facade.performQuery(input);
				},
				"./test/resources/queriesHaveOrder",
				{
					assertOnResult: async (actual, expected) => {
						// expect(actual).to.have.deep.members(await expected);
						expect(actual).to.deep.equal(await expected);
					},
					errorValidator: (error): error is PQErrorKind =>
						error === "ResultTooLargeError" || error === "InsightError",
					assertOnError: (actual, expected) => {
						if (expected === "InsightError") {
							expect(actual).to.be.instanceof(InsightError);
						} else if (expected === "ResultTooLargeError") {
							expect(actual).to.be.instanceof(ResultTooLargeError);
						} else {
							// this should be unreachable
							expect.fail("UNEXPECTED ERROR");
						}
					},
				}
			);
		});

		it ("performQuery crash test (Section)", async function () {
			const sectionsQuery = {
				WHERE: {
					AND: [
						{
							IS: {
								crash_dept: "law"
							}
						},
						{
							IS: {
								crash_title: "immigration law"
							}
						},
						{
							GT: {
								crash_avg: 50
							}
						},
						{
							IS: {
								crash_uuid: "34614"
							}
						}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"crash_dept",
						"crash_avg",
						"crash_title",
						"crash_uuid"
					]
				}
			};

			clearDisk();
			this.timeout(10000);
			let crashFacade1 = new InsightFacade();
			await crashFacade1.addDataset("crash", shortSections, InsightDatasetKind.Sections);
			const result1 = await crashFacade1.performQuery(sectionsQuery);

			let crashFacade2 = new InsightFacade();
			const result2 = await crashFacade2.performQuery(sectionsQuery);

			return expect(result1).to.deep.equal(result2);
		});


		it ("performQuery crash test (Room)", async function () {
			const roomsQuery = {
				WHERE: {
					IS: {
						crash_number: "D316"
					}
				},
				OPTIONS: {
					COLUMNS: [
						"crash_shortname",
						"crash_fullname",
						"crash_shortname",
						"crash_number",
						"crash_name",
						"crash_address",
						"crash_type",
						"crash_furniture",
						"crash_href",
						"crash_lat",
						"crash_lon",
						"crash_seats"
					]
				}
			};

			clearDisk();
			this.timeout(10000);

			const crashFacade1 = new InsightFacade();
			await crashFacade1.addDataset("crash", rooms, InsightDatasetKind.Rooms);
			const result1 = await crashFacade1.performQuery(roomsQuery);

			const crashFacade2 = new InsightFacade();
			const result2 = await crashFacade2.performQuery(roomsQuery);

			return expect(result1).to.deep.equal(result2);
		});


	});
});
