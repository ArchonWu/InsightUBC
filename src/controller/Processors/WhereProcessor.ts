import {SingleKey} from "../IQueryProcessor";
import Section from "../Section";
import {logicKeys, whereNumberKeys, whereStringKeys} from "../Constants";
import {InsightDatasetKind, InsightError} from "../IInsightFacade";
import Dataset from "../Dataset";
import {getStringAfterUnderscore} from "../Utils";
import Room from "../Room";

export default class WhereProcessor {
	private dataset: Dataset;
	private readonly datasetKind: InsightDatasetKind;

	constructor(dataset: Dataset) {
		this.dataset = dataset;
		this.datasetKind = dataset.getDatasetKind();
	}

	public handleWhere(where: SingleKey, allDatasetDataList: Section[] | Room[]): Section[] | Room[]{
		if (where) {
			if (Object.keys(where).length === 0) {
				return allDatasetDataList;
			} else {
				const firstWhereKey = Object.keys(where)[0];
				if (this.datasetKind === InsightDatasetKind.Sections) {
					return this.decideNextBlockHandle(where, allDatasetDataList as Section[], firstWhereKey);
				} else {
					return this.decideNextBlockHandle(where, allDatasetDataList as Room[], firstWhereKey);
				}
			}
		} else {
			throw new InsightError("ERROR in WHERE");
		}
	}

	private decideNextBlockHandle(whereFilters: SingleKey,
		resultKindDataList: Section[] | Room[], nextKey: string): Section[] | Room[] {
		if (whereNumberKeys.includes(nextKey) || whereStringKeys.includes(nextKey)) {	// GT, LT, EQ, IS
			if (this.datasetKind === InsightDatasetKind.Sections) {
				return this.handleNumberStringKeys(whereFilters, resultKindDataList as Section[], nextKey);
			} else {
				return this.handleNumberStringKeys(whereFilters, resultKindDataList as Room[], nextKey);
			}
		} else if (logicKeys.includes(nextKey)) { // AND, OR, NOT
			if (this.datasetKind === InsightDatasetKind.Sections) {
				return this.handleLogicKeys(whereFilters, resultKindDataList as Section[], nextKey);
			} else {
				return this.handleLogicKeys(whereFilters, resultKindDataList as Room[], nextKey);
			}
		} else {
			return [];
		}
	}

	// Handles AND, OR, NOT logic
	private handleLogicKeys(filters: SingleKey,
		resultDataKindList: Section[] | Room[], key: string): Section[] | Room[] {
		let logicResults: Section[] | Room[] = [];

		if (key === "AND") {
			logicResults = resultDataKindList;
			const andFilters = filters[key];
			// do this.decideNextBlockHandle for each filter in AND[]
			andFilters.forEach((filter: SingleKey) => {
				const nextKey = Object.keys(filter)[0];
				// logicResults contains results after processing each filter
				logicResults = this.decideNextBlockHandle(filter, logicResults, nextKey);
			});
		} else if (key === "OR") {
			const orFilter = filters[key];
			orFilter.forEach((filter: SingleKey) => {
				const nextKey = Object.keys(filter)[0];
				const filterResults = this.decideNextBlockHandle(filter, resultDataKindList, nextKey);
				if (this.datasetKind === InsightDatasetKind.Sections) {
					logicResults = (logicResults as Section[]).concat(filterResults as Section[]);
				} else {
					logicResults = (logicResults as Room[]).concat(filterResults as Room[]);
				}
			});
		} else if (key === "NOT") {
			const notFilter = filters[key];
			const nextKey = Object.keys(notFilter)[0];
			// do this.decideNextBlockHandle for all filters inside NOT, and filter them out afterward
			if (this.datasetKind === InsightDatasetKind.Sections) {
				const nextResults = this.decideNextBlockHandle(notFilter, resultDataKindList, nextKey) as Section[];
				logicResults = (logicResults as Section[]).concat(nextResults);
				logicResults = (resultDataKindList as Section[]).filter((section) =>
					!(logicResults as Section[]).includes(section));
			} else {
				const nextResults = this.decideNextBlockHandle(notFilter, resultDataKindList, nextKey) as Room[];
				logicResults = (logicResults as Room[]).concat(nextResults);
				logicResults = (resultDataKindList as Room[]).filter((room) =>
					!(logicResults as Room[]).includes(room));
			}
		} else {
			throw new InsightError(`ERROR in handleLogicKeys ${key}`);
		}
		return logicResults;
	}

	private handleNumberStringKeys
	(filter: SingleKey, resultSections: Section[] | Room[], key: string): Section[] | Room[] {
		const innerObjectOfNextKey = Object.values(filter)[0]; 	// e.g. "sections_avg": 97 from GT{}
		const innerKey = Object.keys(innerObjectOfNextKey)[0];		// "sections_avg"
		const targetField = getStringAfterUnderscore(innerKey);	// "avg"
		const targetValue = innerObjectOfNextKey[innerKey];  							// 97
		if (this.datasetKind === InsightDatasetKind.Sections) {
			return this.dataset.getDataKindListsWithCondition(resultSections as Section[],
				key, targetField, targetValue);
		} else {
			return this.dataset.getDataKindListsWithCondition(resultSections as Room[],
				key, targetField, targetValue);
		}
	}

}
