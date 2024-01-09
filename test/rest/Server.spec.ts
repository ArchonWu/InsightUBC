import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect} from "chai";
import request, {Response} from "supertest";
import {clearDisk} from "../TestUtil";
import * as fs from "fs";
import {App} from "../../src/App";

describe("Facade D3", function () {

	let facade: InsightFacade;
	let server: Server;

	const serverUrl = "http://localhost:4321";
	const zipFileDataPairFull = fs.readFileSync("test/resources/archives/pair.zip");
	const zipFileDataPairSmall = fs.readFileSync("test/resources/archives/pair-smaller-add-delete.zip");
	const zipFileDataCampus = fs.readFileSync("test/resources/archives/campus_ALRD.zip");

	before(async function () {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		try {
			await server.start();
			console.log("Server started!");
		} catch (error) {
			console.error("Error starting the server:", error);
		}
	});

	after(async function () {
		// TODO: stop server here once!
		clearDisk();
		try {
			await server.stop();
			console.log("Server stopped!");
		} catch (error) {
			console.error("Error stopping the server:", error);
		}
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what is going on
		clearDisk();
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	it("PUT test for courses dataset (success 200)", async function () {
		try {
			const endpointUrl = "/dataset/mySections/sections";
			try {
				const res = await request(serverUrl)
					.put(endpointUrl)
					.send(zipFileDataPairSmall)
					.set("Content-Type", "application/x-zip-compressed");
				console.log(res.text);
				expect(res.status).to.be.equal(200);
			} catch (err) {
				console.log(err);
				expect.fail();
			}
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("PUT test for pair & campus dataset (success 200)", async function () {
		try {
			const endpointUrlPUTSections = "/dataset/mySections/sections";
			// add first
			await request(serverUrl)
				.put(endpointUrlPUTSections)
				.send(zipFileDataPairSmall)
				.set("Content-Type", "application/x-zip-compressed");

			const endpointUrlCampus = "/dataset/myRooms/rooms";
			return request(serverUrl)
				.put(endpointUrlCampus)
				.send(zipFileDataCampus)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					console.log("addResult: ", res.text);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("PUT test for courses dataset (fail 400)", async function () {
		try {
			const endpointUrlPUT = "/dataset/mySections/sections";
			// add first
			await request(serverUrl)
				.put(endpointUrlPUT)
				.send(zipFileDataPairSmall)
				.set("Content-Type", "application/x-zip-compressed");

			const endpointUrl = "/dataset/mySections/sections";
			const zipFileDataPair2 =
				fs.readFileSync("test/resources/archives/one_empty_results_course.zip");
			return request(serverUrl)
				.put(endpointUrl)
				.send(zipFileDataPair2)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					console.log(res.text);
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("DELETE test for courses dataset (success 200)", async function () {
		try {
			const endpointUrlPUT = "/dataset/mySectionsDelete/sections";
			// add first
			await request(serverUrl)
				.put(endpointUrlPUT)
				.send(zipFileDataPairSmall)
				.set("Content-Type", "application/x-zip-compressed");

			// delete
			const endpointUrl = "/dataset/mySectionsDelete";
			return request(serverUrl)
				.delete(endpointUrl)
				.then(function (res: Response) {
					console.log(res.text);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("DELETE test for courses dataset (InsightError 400)", async function () {
		try {
			const endpointUrl = "/dataset/_";
			return request(serverUrl)
				.delete(endpointUrl)
				.then(function (res: Response) {
					console.log(res.text);
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("DELETE test for courses dataset (NotFound 404)", async function () {
		try {
			const endpointUrl = "/dataset/mySectionsHaha";
			return request(serverUrl)
				.delete(endpointUrl)
				.then(function (res: Response) {
					console.log(res.body);
					expect(res.status).to.be.equal(404);
				})
				.catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("POST test for courses dataset (success 200)", async function () {
		this.timeout(10000);
		try {
			const endpointUrlPUT = "/dataset/sections/sections";
			// add first
			await request(serverUrl)
				.put(endpointUrlPUT)
				.send(zipFileDataPairFull)
				.set("Content-Type", "application/x-zip-compressed");

			const endpointUrlPOST = "/query";
			const queryObject = {
				WHERE: {
					GT: {
						sections_avg: 97
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			return request(serverUrl)
				.post(endpointUrlPOST)
				.send(queryObject)
				.then(function (res: Response) {
					console.log(res.text);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	it("GET test for courses dataset (success 200)", function () {
		try {
			const endpointUrl = "/datasets";
			try {
				return request(serverUrl)
					.get(endpointUrl)
					.then(function (res: Response) {
						console.log(res.text);
						expect(res.status).to.be.equal(200);
					});
			} catch (err) {
				console.log(err);
				expect.fail();
			}
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});


	// Sample on how to format PUT requests
	/*
	it("PUT test for courses dataset", function () {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(zipFileDataPair)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
	*/

	// The other endpoints work similarly. You should be able to find all instructions at the supertest documentation
});
