import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk} from "../TestUtil";
import Room from "../../src/controller/Room";
import {InsightError} from "../../src/controller/IInsightFacade";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let room: Room;

	describe("geoLocation", function () {
		beforeEach(function () {
			clearDisk();
			room = new Room(null, "", "", 0, "", "", "");
		});

		it("should successfully get ACU lon and lat", async function () {
			const geoData = await room.getGeoLocation("2211 Wesbrook Mall");
			return expect(geoData).to.deep.equal({lat:49.26408,lon:-123.24605});

		});

		it("should successfully get ICCS lon and lat", async function () {
			const geoData = await room.getGeoLocation("2366 Main Mall");
			return expect(geoData).to.deep.equal({lat:49.26118,lon:-123.2488});
		});

		it("should successfully get DMP lon and lat", async function () {
			const geoData = await room.getGeoLocation("6245 Agronomy Road V6T 1Z4");
			return expect(geoData).to.deep.equal({lat:49.26125,lon:-123.24807});
		});
	});
});
