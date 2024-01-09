import {IInsightFacade, InsightDatasetKind, InsightError, NotFoundError} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;
	let rooms: string;

	describe("addDataset", function () {
		before(function () {
			rooms = getContentFromArchives("campus.zip");
		});

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("should successfully add a dataset", function() {
			const room = getContentFromArchives("campus_ALRD.zip");

			const result = facade.addDataset("ubc", room, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.have.members(["ubc"]);
		});

		it("should successfully add 1 dataset (all rooms)", async function() {
			await facade.addDataset("ubc", rooms, InsightDatasetKind.Rooms);
			const datasets = await facade.listDatasets();
			return expect(datasets).to.deep.equal([{id: "ubc", kind: InsightDatasetKind.Rooms, numRows: 364}]);
		});

		it("should successfully add 1 dataset (ALRD)", async function() {
			const room = getContentFromArchives("campus_ALRD.zip");
			await facade.addDataset("alrd", room, InsightDatasetKind.Rooms);
			const datasets = await facade.listDatasets();

			return expect(datasets).to.deep.equal([{id: "alrd", kind: InsightDatasetKind.Rooms, numRows: 5}]);
		});

		it("should successfully add 1 dataset (CEME)", async function() {
			const room = getContentFromArchives("campus_CEME.zip");
			await facade.addDataset("ceme", room, InsightDatasetKind.Rooms);
			const datasets = await facade.listDatasets();

			return expect(datasets).to.deep.equal([{id: "ceme", kind: InsightDatasetKind.Rooms, numRows: 6}]);
		});

		it("should successfully add 1 dataset (1 invalid room, 1 valid", function() {
			const room = getContentFromArchives("campus_invalidAndvalidRooms.zip");
			const result = facade.addDataset("ubc", room, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.have.members(["ubc"]);
		});

		it("should successfully add 1 dataset (1 invalid room, 1 valid - list", async function() {
			const room = getContentFromArchives("campus_invalidAndvalidRooms.zip");
			await facade.addDataset("ubc", room, InsightDatasetKind.Rooms);
			const datasets = await facade.listDatasets();

			return expect(datasets).to.deep.equal([{id: "ubc", kind: InsightDatasetKind.Rooms, numRows: 5}]);
		});

		it("should successfully add two datasets", function() {
			const room1 = getContentFromArchives("campus_ALRD.zip");
			const room2 = getContentFromArchives("campus_CEME.zip");

			facade.addDataset("ubc1", room1, InsightDatasetKind.Rooms);
			const result = facade.addDataset("ubc2", room2, InsightDatasetKind.Rooms);

			return expect(result).to.eventually.have.members(["ubc1", "ubc2"]);
		});

		it("should successfully add two datasets (list two)", async function() {
			const room1 = getContentFromArchives("campus_ALRD.zip");
			const room2 = getContentFromArchives("campus_CEME.zip");

			await facade.addDataset("ubc1", room1, InsightDatasetKind.Rooms);
			await facade.addDataset("ubc2", room2, InsightDatasetKind.Rooms);
			const datasets = await facade.listDatasets();

			return expect(datasets).to.deep.equal([{id: "ubc1", kind: InsightDatasetKind.Rooms, numRows: 5},
				{id: "ubc2", kind: InsightDatasetKind.Rooms, numRows: 6}]);
		});

		it("should reject with invalid dataset id (empty)", function() {
			const result = facade.addDataset("", rooms, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with invalid dataset id (white space)", function() {
			const result = facade.addDataset("   ", rooms, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with invalid dataset id (underscore))", function() {
			const result = facade.addDataset("ubc_rooms", rooms, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with invalid index.htm file (!exist)", function() {
			const invalidRoom = getContentFromArchives("campus_noIndex.zip");

			const result = facade.addDataset("ubc", invalidRoom, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with invalid index.htm file (no table)", function() {
			const invalidRoom = getContentFromArchives("campus_noIndex.zip");

			const result = facade.addDataset("ubc", invalidRoom, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with invalid index.htm file (building file !exist)",  function() {
			const invalidRoom = getContentFromArchives("campus_noBuildings.zip");

			const result = facade.addDataset("ubc", invalidRoom, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with invalid index.htm file (building file !contain valid rooms)",  function() {
			const invalidRoom = getContentFromArchives("campus_noValidRooms.zip");

			const result = facade.addDataset("ubc", invalidRoom, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});

	describe("removeDataset", function () {
		before(function () {
			rooms = getContentFromArchives("campus.zip");
		});

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();

		});

		it("should successfully remove a dataset (list none)", async function() {
			const room = getContentFromArchives("campus_ALRD.zip");
			await facade.addDataset("ubc", room, InsightDatasetKind.Rooms);
			await facade.removeDataset("ubc");
			const result = facade.listDatasets();

			return expect(result).to.eventually.have.members([]);
		});

		it("should successfully add 1 dataset (1 invalid room, 1 valid - list", async function() {
			const room = getContentFromArchives("campus_invalidAndvalidRooms.zip");
			await facade.addDataset("ubc", room, InsightDatasetKind.Rooms);
			await facade.removeDataset("ubc");
			const result = facade.listDatasets();

			return expect(result).to.eventually.have.members([]);
		});

		it("should reject with dataset not yet added", async function() {
			const room = getContentFromArchives("campus_invalidAndvalidRooms.zip");
			await facade.addDataset("ubc", room, InsightDatasetKind.Rooms);
			const result = facade.removeDataset("ubc1");

			return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it("should reject with invalid id (whitespace)", async function() {
			const room = getContentFromArchives("campus_invalidAndvalidRooms.zip");
			await facade.addDataset("ubc", room, InsightDatasetKind.Rooms);
			const result = facade.removeDataset("    ");

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with invalid id (underscore)", async function() {
			const room = getContentFromArchives("campus_invalidAndvalidRooms.zip");
			await facade.addDataset("ubc", room, InsightDatasetKind.Rooms);
			const result = facade.removeDataset("ubc_");

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});
});
