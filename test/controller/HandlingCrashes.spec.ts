import {
	IInsightFacade,
	InsightDatasetKind,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;
	// // Declare datasets used in tests. You should add more datasets like this!
	let sections: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		// clearDisk();
	});


	describe("handling crashes", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
			sections = getContentFromArchives("pair-smaller-add-delete.zip");
		});

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			// clearDisk();
		});

		it("should have one dataset after crash", function () {
			let zipFolder = getContentFromArchives("one_LAW377.zip");
			const result = facade.addDataset("ubc", zipFolder, InsightDatasetKind.Sections);

			// crash occurred, need to create a new instance
			let newFacade = new InsightFacade();
			const newFacadeResult = newFacade.listDatasets();

			expect(newFacadeResult).to.eventually.equal(facade.listDatasets());
		});

		it("should have no dataset after crash", function() {
			let zipFolder = getContentFromArchives("one_LAW377.zip");
			const result = facade.addDataset("ubc", zipFolder, InsightDatasetKind.Sections);

			// crash occurred, need to create a new instance
			let newFacade = new InsightFacade();
			newFacade.removeDataset("ubc");
			const newFacadeResult = newFacade.listDatasets();

			expect(newFacadeResult).to.eventually.equal(facade.listDatasets());
		});

		it ("performQuery crash test", async function () {
			const query = {
				WHERE: {
					AND: [
						{
							IS: {
								sections_dept: "law"
							}
						},
						{
							IS: {
								sections_title: "immigration law"
							}
						},
						{
							GT: {
								sections_avg: 50
							}
						},
						{
							IS: {
								sections_uuid: "34614"
							}
						}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg",
						"sections_title",
						"sections_uuid"
					]
				}
			};
			let zipFolder = getContentFromArchives("one_LAW377.zip");
			await facade.addDataset("sections", zipFolder, InsightDatasetKind.Sections);
			const result1 = await facade.performQuery(query);
			console.log("RESULT1: ", result1);

			let newFacade = new InsightFacade();
			const result2 = await newFacade.performQuery(query);
			console.log("RESULT2: ", result2);

			return expect(result1).to.eventually.have.members(result2);
		});
	});
});
