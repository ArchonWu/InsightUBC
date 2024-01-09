import {SingleKey, Transformations} from "../IQueryProcessor";
import {InsightResult, ResultTooLargeError} from "../IInsightFacade";
import Section from "../Section";
import Decimal from "decimal.js";
import {getDataFromDataKind, getStringAfterUnderscore} from "../Utils";
import Room from "../Room";

export default class TransformationsProcessor {
	private applyColumns: string[] = [];

	public handleTransformations(transformations: Transformations, columns: string[], results: Section[] | Room[]):
		InsightResult[] {

		// handleGroup: grouped sections in results, and return all groups as a single map
		let groupedResultsMap = this.handleGroup(transformations.GROUP, results);

		// get all applyColumns
		if (transformations.APPLY) {
			for (const applyObject of transformations.APPLY) {
				const applyKeys = Object.keys(applyObject);
				this.applyColumns.push(...applyKeys);
			}
		}

		if (transformations.APPLY) {
			return this.handleApply(transformations.APPLY, columns, groupedResultsMap);
		}

		return [];
	}

	private handleGroup(groups: string[], results: Section[] | Room[]): Map<string, Section[]> | Map<string, Room[]>{
		const groupings = groups.map((group) => getStringAfterUnderscore(group));
		let groupedResultsMap;
		if (Array.isArray(results) && results.length > 0 && results[0] instanceof Section) {
			groupedResultsMap = new Map<string, Section[]>();
			for (const kindData of results) {
				const kindGroupKey = this.getGroupKey(groupings, kindData);
				const existingSections = groupedResultsMap.get(kindGroupKey);
				if (existingSections) {
					groupedResultsMap.set(kindGroupKey, existingSections.concat(kindData as Section));
				} else {
					groupedResultsMap.set(kindGroupKey, [kindData as Section]);
				}
			}
		} else {
			groupedResultsMap = new Map<string, Room[]>();
			for (const kindData of results) {
				const kindGroupKey = this.getGroupKey(groupings, kindData);
				const existingSections = groupedResultsMap.get(kindGroupKey);
				if (existingSections) {
					groupedResultsMap.set(kindGroupKey, existingSections.concat(kindData as Room));
				} else {
					groupedResultsMap.set(kindGroupKey, [kindData as Room]);
				}
			}
		}
		return groupedResultsMap;
	}

	private handleApply(applyKeys: SingleKey[], columns: string[],
		groupedResultsMap: Map<string, Section[]> | Map<string, Room[]>):	InsightResult[] {
		let insightResultsArray: Array<{[key: string]: string | number}> = [];

		groupedResultsMap.forEach((dataKindArray) => {
			let insightResult: {[key: string]: string | number} = {};
			applyKeys.forEach((applyKey) => {
				const applyTokenColumnName = Object.keys(applyKey)[0];
				const applyToken = Object.keys(applyKey[applyTokenColumnName])[0];
				const applySectionName =
					getStringAfterUnderscore(Object.values(applyKey[applyTokenColumnName])[0]);
				if (columns.includes(applyTokenColumnName)) {
					insightResult[applyTokenColumnName]
						= this.calculateAggregation(dataKindArray, applySectionName, applyToken);
				}
			});
			columns.forEach((column) => {
				if (!this.applyColumns.includes(column)) {
					const firstDataKind = dataKindArray[0];	// any Section/Room in dataKindArray works, as they have the same value
					insightResult[column] = getDataFromDataKind(firstDataKind, getStringAfterUnderscore(column));
				}
			});
			insightResultsArray.push(insightResult);
		});

		if (insightResultsArray.length > 5000) {
			throw new ResultTooLargeError
			("The result is too big. Only queries with a maximum of 5000 results are supported.");
		}

		return insightResultsArray as InsightResult[];
	}

	private calculateAggregation(sections: Section[] | Room[], key: string, aggregation: string): number {
		let aggregatedResult: number = 0;
		if (aggregation === "MAX") {
			aggregatedResult = this.calculateMax(sections, key);
		} else if (aggregation === "MIN") {
			aggregatedResult = this.calculateMin(sections, key);
		} else if (aggregation === "COUNT") {
			aggregatedResult = this.calculateCount(sections, key);
		} else if (aggregation === "SUM") {
			aggregatedResult = this.calculateSum(sections, key);
		} else if (aggregation === "AVG") {
			aggregatedResult = this.calculateAvg(sections, key);
		}
		return aggregatedResult;
	}

	private calculateMax(dataKinds: Section[] | Room[], key: string): number {
		const items: Array<Section | Room> = ([] as Array<Section | Room>).concat(...dataKinds);
		let max = Math.max();
		for (const item of items) {
			const value = (item as any)[key] as number;
			max = Math.max(max, value);
		}
		return max;
	}

	private calculateMin(dataKinds: Section[] | Room[], key: string): number {
		const items: Array<Section | Room> = ([] as Array<Section | Room>).concat(...dataKinds);
		let min = -Math.max();
		for (const item of items) {
			const value = (item as any)[key] as number;
			min = Math.min(min, value);
		}
		return min;
	}

	private calculateCount(dataKinds: Section[] | Room[], key: string): number {
		const items: Array<Section | Room> = ([] as Array<Section | Room>).concat(...dataKinds);
		let allOccurrences = new Set();
		for (const item of items) {
			let value = (item as any)[key];
			allOccurrences.add(value);
		}
		return allOccurrences.size;
	}

	private calculateSum(dataKinds: Section[] | Room[], key: string): number {
		const items: Array<Section | Room> = ([] as Array<Section | Room>).concat(...dataKinds);
		let sum = 0;
		for (const item of items) {
			const value = (item as any)[key] as number;
			sum += value;
		}
		return parseFloat(sum.toFixed(2));
	}

	private calculateAvg(dataKinds: (Section[] | Room[]), key: string): number {		// refactored with ChatGPT
		const items: Array<Section | Room> = ([] as Array<Section | Room>).concat(...dataKinds);
		const totalSum = items.reduce((total, item) =>
			total.add(new Decimal((item as any)[key] as number)), new Decimal(0));
		const numRows = items.length;
		const average = totalSum.toNumber() / numRows;

		return Number(average.toFixed(2));
	}

	private getGroupKey(groupings: string[], dataKind: Section | Room): string {
		let groupKey = "";
		for (const group of groupings) {
			if (dataKind instanceof Section) {
				groupKey = groupKey + dataKind.getSectionColumnField(group).toString();
			} else {
				groupKey = groupKey + dataKind.getRoomColumnField(group).toString();
			}
		}
		return groupKey;
	}

}
