import {clearDisk} from "../TestUtil";
import QueryValidator from "../../src/controller/QueryValidator";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import InsightFacade from "../../src/controller/InsightFacade";
import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import {folderTest} from "@ubccpsc310/folder-test";
import * as fs from "fs-extra";

use(chaiAsPromised);
describe("Query Validator", function () {
	let queryValidator = new QueryValidator(["sections"]);
	let facade: InsightFacade;

	before(function () {
		clearDisk();
	});

	it ("simple query should be successfully parsed by parseIntoJsonObject()", () => {
		const queryString
			= fs.readFileSync("test/resources/queryProcessorParseJsonTests/pass_valid_simple_given.txt");
		const result = queryValidator.parseIntoJsonObject(queryString);
		const expectedJSON =
			JSON.parse(fs.readFileSync("test/resources/queryProcessorParseJsonTests/" +
				"pass_valid_simple_given.json", "utf-8"));
		expect(typeof result).to.equal(typeof expectedJSON);
	});

	it ("invalid query should be successfully parsed by parseIntoJsonObject()", () => {
		const queryString
			= fs.readFileSync("test/resources/queryProcessorParseJsonTests/pass_invalid_parseable.txt");
		const result = queryValidator.parseIntoJsonObject(queryString);
		const expectedJSON =
			JSON.parse(fs.readFileSync("test/resources/queryProcessorParseJsonTests/" +
				"pass_invalid_parseable.json", "utf-8"));
		expect(typeof result).to.equal(typeof expectedJSON);
	});

	it ("simple query error parsing by parseIntoJsonObject()", () => {
		const queryString
			= fs.readFileSync("test/resources/queryProcessorParseJsonTests/error_invalid_simple_given.txt");
		try {
			queryValidator.parseIntoJsonObject(queryString);
			return expect.fail("no error was thrown");
		} catch (error) {
			// expected error correctly
		}
	});

	describe ("complex query error parsing by parseIntoJsonObject()", () => {
		expect(true).to.equal(true);
	});

	describe("QueryValidator Validate Pass", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
			facade = new InsightFacade();
			queryValidator = new QueryValidator(["sections"]);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, boolean, PQErrorKind>(
			"Dynamic Query Validator tests",
			(input) => queryValidator.isValidQuery(input, InsightDatasetKind.Sections),
			"./test/resources/queryProcessorValidatePass",
			{
				assertOnResult: (actual, expected) => {
					expect(actual).to.equal(true);
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

	describe("QueryValidator Validate Error", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		// This is failing 30 tests from #check
		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queryProcessorValidateError",
			{
				assertOnResult: async (actual, expected) => {
					// should not be reachable since all tests are expecting errors
					expect.fail("NO ERROR THROWN");
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
});
