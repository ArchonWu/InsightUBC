import {clearDisk, getContentFromArchives} from "../TestUtil";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import InsightFacade from "../../src/controller/InsightFacade";
import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import {folderTest} from "@ubccpsc310/folder-test";

use(chaiAsPromised);

describe("Query Processor", function () {
	let facade: IInsightFacade;
	let sections: string;

	before(async function () {
		clearDisk();
		this.timeout(5000);
		facade = new InsightFacade();
		sections = getContentFromArchives("pair.zip");
		await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
	});

	describe("processQuery() (with ORDER checking)", () => {

		before(async function () {
			console.info(`Before: ${this.test?.parent?.title}`);
			this.timeout(5000);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queriesHaveOrder",
			{
				assertOnResult: async (actual, expected) => {
					expect(actual).to.have.deep.equals(await expected);
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

	// duplicate as in InsightFacade.spec.ts
	describe("Aggregation Tests for Sections", () => {

		before(async function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queryTransformations",
			{
				assertOnResult: async (actual, expected) => {
					expect(actual).to.have.deep.members(await expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					console.log("Error Message: ", actual);
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

	describe("Aggregation Tests for Sections (DIR)", () => {

		before(async function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests (sorting)",
			(input) => facade.performQuery(input),
			"./test/resources/queriesHaveOrder",
			{
				assertOnResult: async (actual, expected) => {
					expect(actual).to.deep.equal(await expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					console.log("Error Message: ", actual);
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
});
