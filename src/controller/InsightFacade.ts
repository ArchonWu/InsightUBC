import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import QueryValidator from "./QueryValidator";
import {QueryObject} from "./IQueryProcessor";
import JSZip from "jszip";
import Section, {SavedSection} from "./Section";
import Dataset from "./Dataset";
import QueryProcessor from "./QueryProcessor";
import * as fs from "fs";
import DatasetProcessor from "./DatasetProcessor";
import Room, {SavedRoom} from "./Room";

const dataDirectory = "./data/";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private insightDatasets: Map<string, InsightDataset>;
	public datasets: Map<string, Dataset>;
	private datasetDirectory = dataDirectory;

	constructor() {
		this.insightDatasets = new Map<string, InsightDataset>();
		this.datasets = new Map<string, Dataset>();
		try {
			if (fs.existsSync(dataDirectory)) {
				this.loadDatasetsFromDisk().then(() =>
					console.log("Finish loading saved datasets"));
			}
		} catch (err) {
			console.log(err);
		}
	}

	private checkDataDirectory() {
		try {
			if (!fs.existsSync(dataDirectory)) {
				fs.mkdirSync(dataDirectory);
			}
		} catch (err) {
			console.log(err);
		}
	}

	// re-adding multiple datasets
	private async loadDatasetsFromDisk() {
		// Sections
		try {
			const dataFilePathSections = this.datasetDirectory.concat("savedSectionsDatasets.json");
			const sectionsData = fs.readFileSync(dataFilePathSections, "utf-8");
			const parsedSectionsData = JSON.parse(sectionsData);
			for (const sectionDatasetID in parsedSectionsData) {
				const jsonSections = parsedSectionsData[sectionDatasetID];
				const sectionList = this.processPreviouslySavedSections(jsonSections);
				const dataset = new Dataset(InsightDatasetKind.Sections);
				dataset.addDatasetData(sectionList, InsightDatasetKind.Sections);
				this.datasets.set(sectionDatasetID, dataset);
				const insightDataset: InsightDataset =
					{id: sectionDatasetID, kind: InsightDatasetKind.Sections, numRows: jsonSections.length};
				this.insightDatasets.set(sectionDatasetID, insightDataset);
				this.updateInsightDatasets(sectionDatasetID);
			}
		} catch (err) {
			console.log("No savedSectionsDatasets.json");
		}

		// Rooms
		try {
			const dataFilePathRooms = this.datasetDirectory.concat("savedRoomsDatasets.json");
			const roomsData = fs.readFileSync(dataFilePathRooms, "utf-8");
			const parsedRoomsData = JSON.parse(roomsData);
			for (const roomDatasetID in parsedRoomsData) {
				const jsonRooms = parsedRoomsData[roomDatasetID];
				const roomList = this.processPreviouslySavedRooms(jsonRooms);
				const dataset = new Dataset(InsightDatasetKind.Rooms);
				dataset.addDatasetData(roomList, InsightDatasetKind.Rooms);
				this.datasets.set(roomDatasetID, dataset);
				const insightDataset: InsightDataset =
					{id: roomDatasetID, kind: InsightDatasetKind.Rooms, numRows: jsonRooms.length};
				this.insightDatasets.set(roomDatasetID, insightDataset);
				this.updateInsightDatasets(roomDatasetID);
			}
		} catch (err) {
			// console.error("Error reading JSON file (for room):", err);
			console.log("No savedRoomsDatasets.json");
			// no previously saved Rooms dataset
		}
	}

	// Process each section in the savedList, part of the data persisting process
	private processPreviouslySavedSections(savedList: SavedSection[]): Section[] {
		const sectionList: Section[] = [];
		savedList.forEach((savedSection) => {
			const section = new Section(savedSection as SavedSection, "SavedSection");
			sectionList.push(section);
		});
		return sectionList;
	}

	private processPreviouslySavedRooms(savedRoomList: SavedRoom[]): Room[] {
		const roomList: Room[] = [];
		savedRoomList.forEach((savedRoom) => {
			const room = new Room(savedRoom as SavedRoom, "", "", -9999, "", "", "");
			roomList.push(room);
		});
		return roomList;
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if(this.isInvalidID(id)) {
			throw new InsightError("Error adding the dataset: invalid id");
		} else if(this.datasetAlreadyExists(id)) {
			throw new InsightError("Error adding the dataset: dataset with id already exists");
		}

		this.datasets.set(id, new Dataset(kind));
		const zip = new JSZip();

		try {
			const loadedZip = await zip.loadAsync(content, {base64: true});
			const datasetProcessor = new DatasetProcessor(loadedZip, id, this.datasets);
			const parsedData = await datasetProcessor.process(kind);
			if (parsedData.length === 0) {
				return Promise.reject(new InsightError("No valid rooms (parsedData.length === 0)"));
			}

			this.checkDataDirectory();
			const dataset: InsightDataset = {id, kind, numRows: parsedData.length};
			this.insightDatasets.set(id, dataset);
			this.updateInsightDatasets(id);

			// Done adding/updating to data to this.Datasets/this.insightDatasets, save modelled data to corresponding .json
			if(kind === InsightDatasetKind.Sections) {
				const datasetData: {[key: string]: Section[]} = {};
				this.datasets.forEach((datasetInMap, key) => {
					datasetData[key] = datasetInMap.getAllDataInDataList() as Section[];
				});

				const dataFilePath = this.datasetDirectory.concat("savedSectionsDatasets.json");
				fs.writeFileSync(dataFilePath, JSON.stringify(datasetData, null, 2), "utf-8");

			} else if(kind === InsightDatasetKind.Rooms) {
				const datasetData: {[key: string]: Room[]} = {};
				this.datasets.forEach((datasetInMap, key) => {
					datasetData[key] = datasetInMap.getAllDataInDataList() as Room[];
				});

				const dataFilePath = this.datasetDirectory.concat("savedRoomsDatasets.json");
				fs.writeFileSync(dataFilePath, JSON.stringify(datasetData, null, 2), "utf-8");
			}

			return Array.from(this.insightDatasets.keys());
		} catch(error) {
			console.log(error);
			return Promise.reject(new InsightError(`Error adding the dataset: ${error}`));
		}
	}

	private isInvalidID(id: string): boolean {
		return (id === null) || id.includes("_") || (id.trim().length === 0);
	}

	private datasetAlreadyExists(id: string): boolean {
		return this.datasets.has(id);
	}


	public async removeDataset(id: string): Promise<string> {
		if(this.isInvalidID(id)) {
			return Promise.reject(new InsightError("Error removing the dataset: invalid id"));
		}

		const dataFilePathSections = this.datasetDirectory.concat("savedSectionsDatasets.json");
		const dataFilePathRooms = this.datasetDirectory.concat("savedRoomsDatasets.json");

		try {
			if(fs.existsSync(dataFilePathSections)) {
				const sectionsData = fs.readFileSync(dataFilePathSections, "utf-8");
				let parsedSectionsData = JSON.parse(sectionsData);
				const sectionIDs = Object.keys(parsedSectionsData);

				if (sectionIDs.includes(id)) {
					parsedSectionsData = delete parsedSectionsData[id];
					fs.writeFileSync(dataFilePathSections, JSON.stringify(parsedSectionsData, null, 2), "utf-8");
					this.insightDatasets.delete(id);
					return Promise.resolve(id);
				}
			}

			// check in savedRoomsDatasets.json if id does not exist in savedSectionsDatasets.json
			if(fs.existsSync(dataFilePathRooms)) {
				const roomsData = fs.readFileSync(dataFilePathRooms, "utf-8");
				let parsedRoomsData = JSON.parse(roomsData);
				const roomIDs = Object.keys(parsedRoomsData);

				if (roomIDs.includes(id)) {
					parsedRoomsData = delete parsedRoomsData[id];
					fs.writeFileSync(dataFilePathRooms, JSON.stringify(parsedRoomsData, null, 2), "utf-8");
					this.insightDatasets.delete(id);
					return Promise.resolve(id);

				}
			}

			return Promise.reject(new NotFoundError("Error removing the dataset: dataset not found"));
		} catch (error) {
			return Promise.reject(new InsightError("Error removing the dataset"));
		}
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		const existingDatasetsIDs: string[] = Array.from(this.datasets.keys());
		const queryValidator: QueryValidator = new QueryValidator(existingDatasetsIDs);
		const queryingDatasetID = queryValidator.getQueryingDatasetIdFromColumnsOrApply(query as QueryObject);
		const queryingDatasetKind = this.insightDatasets.get(queryingDatasetID)?.kind;
		let allDatasetData = this.datasets.get(queryingDatasetID)?.getAllDataInDataList();
		if (!allDatasetData) {
			throw new InsightError(`Referenced dataset ${queryingDatasetID} not added yet`);
		}
		try {
			if (queryValidator.isValidQuery(query, queryingDatasetKind)) {
				if (allDatasetData) {
					let queryProcessor =
						new QueryProcessor(allDatasetData, queryingDatasetKind);
					const queryResults = queryProcessor.processQuery(query as QueryObject, allDatasetData);
					return Promise.resolve(queryResults);
				} else {
					return Promise.reject(new InsightError("Dataset sections are undefined."));
				}
			} else {
				return Promise.reject(new InsightError("Error processing the query"));
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(Array.from(this.insightDatasets.values()));
	}

	private updateInsightDatasets(id: string): void {
		let numRows = this.datasets.get(id)?.getDatasetLength();
		if (this.insightDatasets.has(id)) {
			const currDataset = this.insightDatasets.get(id);
			if (currDataset && numRows) {
				currDataset.numRows = numRows;
				this.insightDatasets.set(id, currDataset);
			}
		} else {
			console.log(`Non existing ID: ${id}`);
		}
		// queryValidator.updateAddExistingDatasetsIDs(id);
	}
}
