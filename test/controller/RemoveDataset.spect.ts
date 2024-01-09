import InsightFacade from "../../src/controller/InsightFacade";
import {clearDisk, getContentFromArchives} from "../resources/archives/TestUtil";
import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";

// import {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import chai from "chai";
import {folderTest} from "@ubccpsc310/folder-test";

chai.use(chaiAsPromised);
const expect = chai.expect;

type Input = unknown;
type Output = InsightResult[];
type Error = "InsightError" | "ResultTooLargeError";

describe("InsightFacade: removeDataset", function () {
	let sections: string;
	let facade: InsightFacade;

	before(function () {
		sections = getContentFromArchives("pair-smaller-add-delete.zip");
	});

	beforeEach(function () {
		facade = new InsightFacade();
	});

	it("should successfully remove a dataset", async function () {
		await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
		const result = await facade.removeDataset("ubc");

		return expect(result).equal("ubc");
	});

	it("should successfully remove two dataset", async function () {
		await facade.addDataset("ubc1", sections, InsightDatasetKind.Sections);
		await facade.addDataset("ubc2", sections, InsightDatasetKind.Sections);

		try {
			await facade.removeDataset("ubc1");
		} catch (error) {
			return expect.fail("UNEXPECTED ERROR");
		}

		const result2 = await facade.removeDataset("ubc2");

		return expect(result2).equal("ubc2");
	});


	it("should reject with an invalid dataset id (empty) for removing", async function () {
		const result = facade.removeDataset("");

		return expect(result).to.eventually.be.rejectedWith(InsightError);
	});
});
