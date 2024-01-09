import {Transformations} from "../IQueryProcessor";
import {InsightDatasetKind, InsightError} from "../IInsightFacade";
import {applyTokens, necessaryTransformationsKeys, validRoomsFields, validSectionFields} from "../Constants";
import {getStringAfterUnderscore, getStringBeforeUnderscore} from "../Utils";

export class TransformationsValidator {
	private transformationsBlock: Transformations;
	private validGroupApplyKeys: string[] = [];
	private validNumberTypes: string[] = [];
	private validStringTypes: string[] = [];
	private queryingDatasetID: string = "";
	private queryingDatasetKind: InsightDatasetKind = InsightDatasetKind.Sections;

	constructor(transformationsBlock: Transformations, validNumberTypes: string[], validStringTypes: string[],
		queryingDatasetKind: InsightDatasetKind) {
		this.transformationsBlock = transformationsBlock;
		this.validGroupApplyKeys = [];
		this.validNumberTypes = validNumberTypes;
		this.validStringTypes = validStringTypes;
		this.queryingDatasetID = this.getQueryingDatasetIDFromGroups();
		this.queryingDatasetKind = queryingDatasetKind;
	}

	private getQueryingDatasetIDFromGroups(): string {
		if (this.transformationsBlock.GROUP && this.transformationsBlock.GROUP.length === 0) {
			throw new InsightError("EMPTY GROUP");
		} else if (this.transformationsBlock.GROUP && this.transformationsBlock.GROUP.length > 0) {
			return getStringBeforeUnderscore(this.transformationsBlock.GROUP[0]);
		} else {
			return "";
		}
	}

	public validateTransformationsBlock(transformationsBlock: Transformations): boolean {
		if (!transformationsBlock.APPLY) {
			throw new InsightError("TRANSFORMATIONS missing APPLY");
		}
		if (!transformationsBlock.GROUP) {
			throw new InsightError("TRANSFORMATIONS missing GROUP");
		} else if (transformationsBlock.GROUP.length === 0){
			throw new InsightError("GROUP must be a non-empty array");
		}

		// Check for keys in Options that are not one of "this.validTransformationsKey" ("GROUP", "APPLY")
		Object.keys(transformationsBlock).forEach((key) => {
			if (!necessaryTransformationsKeys.includes(key)) {
				throw new InsightError("Extra keys in TRANSFORMATIONS");
			}
		});

		this.updateValidGroupApplyKeys();
		if (this.validGroupApplyKeys) {
			const checkDuplicateKeys = this.hasDuplicateKeys(this.validGroupApplyKeys);
			if (checkDuplicateKeys !== false) {
				throw new InsightError(`Duplicate APPLY key ${checkDuplicateKeys}`);
			}
		}

		if (this.transformationsBlock.APPLY) {
			this.transformationsBlock.APPLY.forEach((applyKey) => {
				// check for ["MAX", "MIN", "AVG", "COUNT", "SUM"]
				const innerObject = Object.values(applyKey)[0];
				const operator = Object.keys(innerObject)[0];
				if (!applyTokens.includes(operator)) {
					throw new InsightError("Invalid transformation operator");
				}

				const value = Object.values(innerObject)[0];
				const key = getStringAfterUnderscore(value);
				// check for correct types for each applyToken
				if (operator === "MAX" || operator === "MIN" || operator === "AVG" || operator === "SUM") {
					if (this.validStringTypes.includes(key)) {
						throw new InsightError(`Invalid key type ${key} in ${operator}`);
					}
					if (!this.validNumberTypes.includes(key)) {
						throw new InsightError(`Invalid apply rule target key in ${key}`);
					}
				} else if (operator === "COUNT") {
					if (!this.validNumberTypes.includes(key) && !this.validStringTypes.includes(key)) {
						throw new InsightError(`Invalid apply rule target key in ${key}`);
					}
				}
			});
		}
		return true;
	}

	// ChatGPT: add all keys from GROUP and Apply to this.validGroupApplyKeys
	private updateValidGroupApplyKeys(): void {
		const groups = Array.from(new Set<string> (this.transformationsBlock.GROUP));
		for (const groupKey of groups) {
			if (!this.isValidKindKey(groupKey)) {
				throw new InsightError("group key error!!!");
			}
		}
		this.validGroupApplyKeys = this.validGroupApplyKeys.concat(groups);

		const applyBlock = this.transformationsBlock.APPLY;
		if (applyBlock) {
			for (const applyObject of applyBlock) {
				const applyKeys = Object.keys(applyObject);
				if (applyKeys.length !== 1) {
					throw new InsightError(`Apply rule should only have 1 key, has ${applyKeys.length}`);
				}
				this.validGroupApplyKeys.push(...applyKeys);
			}
		}
	}

	private isValidKindKey(key: string) {
		const queryingDatasetID = getStringBeforeUnderscore(key);
		const queryingKindKey = getStringAfterUnderscore(key);
		return !(this.queryingDatasetID !== queryingDatasetID
			|| (this.queryingDatasetKind === InsightDatasetKind.Sections
				&& !validSectionFields.includes(queryingKindKey))
			|| (this.queryingDatasetKind === InsightDatasetKind.Rooms
				&& !validRoomsFields.includes(queryingKindKey)));
	}

	public getValidGroupApplyKeys() {
		return this.validGroupApplyKeys;
	}

	private hasDuplicateKeys(array: string[]): boolean | string {
		const alreadyHaveKeys = new Set();
		for (const key of array) {
			if (alreadyHaveKeys.has(key)) {
				return key;
			}
			alreadyHaveKeys.add(key);
		}
		return false;
	}

	public getQueryingDatasetID(): string {
		return this.queryingDatasetID;
	}

}
