import {Options, Order} from "../IQueryProcessor";
import {InsightDatasetKind, InsightResult, ResultTooLargeError} from "../IInsightFacade";
import Section from "../Section";
import {getStringAfterUnderscore} from "../Utils";
import {roomsNumberTypes, roomsStringTypes, sectionsNumberTypes, sectionsStringTypes} from "../Constants";
import Room from "../Room";

export default class OptionsProcessor {
	private readonly datasetKind: InsightDatasetKind;

	constructor(datasetKind: InsightDatasetKind) {
		this.datasetKind = datasetKind;
	}

	public handleOrderTransformed(order: Order | string, results: InsightResult[]): InsightResult[] {
		let sortedInsightResults = results;

		if (typeof order === "string") {
			if (order === "DOWN") {
				sortedInsightResults = this.sortByFieldDown(results, order);
			} else {
				sortedInsightResults = this.sortByFieldUp(results, order);
			}
		} else if (typeof order === "object") {
			// ChatGPT improved comparison structure
			const dir = order.dir;
			const tieBreakerKeys = order.keys;
			if (dir === "UP") {
				sortedInsightResults = this.sortByFieldUpTieBreaker(results, tieBreakerKeys);
			} else if (dir === "DOWN") {
				sortedInsightResults = this.sortByFieldDownTieBreaker(results, tieBreakerKeys);
			}
		}
		return sortedInsightResults;
	}

	// ChatGPT
	private sortByFieldUpTieBreaker<T>(items: T[], tieBreakerKeys: string[]): T[] {
		let sortedItems = items.slice(); // Clone the array to avoid modifying the original
		sortedItems.sort((a, b) => {
			for (const tieBreakerKey of tieBreakerKeys) {
				const valueA = (a as any)[tieBreakerKey];
				const valueB = (b as any)[tieBreakerKey];
				if (valueA < valueB) {
					return -1;
				} else if (valueA > valueB) {
					return 1;
				}
				// values are equal (0), continue to the next tieBreakerKey
			}
			return 0; // all tiebreakers are equal, items are considered equal, order does not matter
		});
		return sortedItems;
	}

	private sortByFieldDownTieBreaker<T>(items: T[], tieBreakerKeys: string[]): T[] {
		let sortedItems = items.slice(); // Clone the array to avoid modifying the original
		sortedItems.sort((a, b) => {
			for (const tieBreakerKey of tieBreakerKeys) {
				const valueA = (a as any)[tieBreakerKey];
				const valueB = (b as any)[tieBreakerKey];
				if (valueA > valueB) {
					return -1;
				} else if (valueA < valueB) {
					return 1;
				}
				// values are equal (0), continue to the next tieBreakerKey
			}
			return 0; // all tiebreakers are equal, items are considered equal, order does not matter
		});
		return sortedItems;
	}


	public handleOptionsSimple(options: Options, results: Section[] | Room[]): InsightResult[] {
		let resultSections = results;
		if (options.ORDER && typeof options.ORDER === "string") {
			resultSections = this.handleOrder(options.ORDER as string, resultSections);
		} else if (options.ORDER && typeof options.ORDER === "object") {
			const insightResults = this.convertToInsightResultsNoTransformations(options.COLUMNS, resultSections);
			return this.handleOrderTransformed(options.ORDER, insightResults);
		}
		return this.convertToInsightResultsNoTransformations(options.COLUMNS, resultSections);
	}

	private handleOrder(order: string, results: Section[] | Room[]): Section[] | Room[] {
		let sortedResults = results;
		const orderField = getStringAfterUnderscore(order);
		if (sectionsStringTypes.includes(orderField) || roomsStringTypes.includes(orderField)) {
			sortedResults = this.sortByFieldUp(results as any[], orderField, true);
		} else if (sectionsNumberTypes.includes(orderField) || roomsNumberTypes.includes(orderField)) {
			sortedResults = this.sortByFieldUp(results as any[], orderField, false);
		}
		return sortedResults;
	}

	// ChatGPT: sort refactored
	private sortByFieldUp<T>(items: T[], field: string, isStringType: boolean = false): T[] {
		return items.sort((a, b) => {
			if (isStringType) {
				const valueA = (a as any)[field] as string;
				const valueB = (b as any)[field] as string;
				if (valueA < valueB) {
					return -1;
				} else if (valueA > valueB) {
					return 1;
				} else {
					return 0;
				}
			} else {
				return ((a as any)[field] as number) - ((b as any)[field] as number);
			}
		});
	}

	private sortByFieldDown<T>(items: T[], field: string, isStringType: boolean = false): T[] {
		return items.sort((a, b) => {
			if (isStringType) {
				const valueA = (a as any)[field] as string;
				const valueB = (b as any)[field] as string;
				if (valueA > valueB) {
					return -1;
				} else if (valueA < valueB) {
					return 1;
				} else {
					return 0;
				}
			} else {
				return ((b as any)[field] as number) - ((a as any)[field] as number);
			}
		});
	}

	// For queries with no Transformations
	private convertToInsightResultsNoTransformations(columns: string[], resultDataKindList: Section[] | Room[]):
		InsightResult[] {
		// remove duplicate Sections/Rooms using Set
		let uniqueKindResults: Set<Section> | Set<Room>;
		if (this.datasetKind === InsightDatasetKind.Sections) {
			uniqueKindResults = new Set<Section>();
		} else {
			uniqueKindResults = new Set<Room>();
		}

		resultDataKindList.forEach((dataKind) => {
			if (this.datasetKind === InsightDatasetKind.Sections) {
				(uniqueKindResults as Set<Section>).add(dataKind as Section);
			} else {
				(uniqueKindResults as Set<Room>).add(dataKind as Room);
			}
		});

		if (uniqueKindResults.size > 5000) {
			throw new ResultTooLargeError
			("The result is too big. Only queries with a maximum of 5000 results are supported.");
		}

		const targetColumns: string[] = columns.map((col) => getStringAfterUnderscore(col));

		// for each section, add all the corresponding columns with values to insightResultsArray
		let insightResultsArray: Array<{[key: string]: string | number}> = [];
		uniqueKindResults.forEach((dataKind) => {
			let insightResult: {[key: string]: string | number} = {};
			targetColumns.forEach((col) => {
				let insightColumnKey = columns[targetColumns.indexOf(col)];
				if (this.datasetKind === InsightDatasetKind.Sections) {
					insightResult[insightColumnKey] = (dataKind as Section).getSectionColumnField(col);
				} else {
					insightResult[insightColumnKey] = (dataKind as Room).getRoomColumnField(col);
				}
			});
			insightResultsArray.push(insightResult);
		});
		return insightResultsArray as InsightResult[];
	}
}
