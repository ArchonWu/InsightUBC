import {clearDisk} from "../TestUtil";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";

import {promises as fs} from "fs";
import Section from "../../src/controller/Section";

use(chaiAsPromised);
describe("Section", function () {
	before(function () {
		clearDisk();
	});

	describe("parsing a single Section", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		it("should successfully add a section", async function () {
			const fileContent = await fs.readFile("test/resources/section_jsons/BIOL111", "utf-8");
			const jsonData = JSON.parse(fileContent);
			console.log(jsonData.result[0]);
			const result = new Section(jsonData.result[0], "JsonSection");
			console.log(result);
			return expect(result).to.deep.equal({
				uuid: "4055",
				id: "111",
				title: "intr modern bio",
				instructor: "zeiler, kathryn",
				dept: "biol",
				year: 2014,
				avg: 70.77,
				pass: 74,
				fail: 5,
				audit: 1
			});
		});
	});
});
