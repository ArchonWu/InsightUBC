import {SingleKey} from "../IQueryProcessor";
import {InsightError} from "../IInsightFacade";
import
{whereNumberKeys, whereStringKeys} from "../Constants";
import {getStringAfterUnderscore, getStringBeforeUnderscore} from "../Utils";

export default class WhereValidator {
	private readonly queryingDatasetID: string;
	private validNumberTypes: string[] = [];
	private validStringTypes: string[] = [];
	private validKindFields: string[] = [];

	constructor(queryingDatasetID: string, validNumberTypes: string[], validStringTypes: string[],
		validKindFields: string[]) {
		this.queryingDatasetID = queryingDatasetID;
		this.validNumberTypes = validNumberTypes;
		this.validStringTypes = validStringTypes;
		this.validKindFields = validKindFields;
	}

	// Valid: Only one key or zero key (ResultTooBigError) allowed in WHERE key
	public validateWhereBlock(filter: SingleKey): boolean {
		const numKeys = Object.keys(filter).length;
		if (numKeys === 0) {
			return true;
		} else if (numKeys === 1) {
			return this.validateLogicKeys(filter);
		} else {
			throw new InsightError("WHERE should only have 1 key");
		}
	}

	private validateLogicKeys(filter: SingleKey): boolean {
		const key = Object.keys(filter)[0]; // assume only one filter

		if (key === "AND" || key === "OR") {
			if (!filter[key] || filter[key]?.length === 0) {
				throw new InsightError(`${key} must be a non-empty array`);
			}
			for (const andOrFilter of filter[key] as SingleKey[]) {
				let isValidKey = this.validateKey(andOrFilter as SingleKey);
				if (!isValidKey) {
					return false;
				}
			}
		} else if (key === "NOT") {
			return this.validateLogicKeys(filter[key]);
		} else {
			return this.validateKey(filter);
		}
		return true;
	}

	// Valid: only one key in each element in array filters (AND, OR);
	//	   else one pair of {key: innerKey} in object filters (GT, LT, EQ, NOT)
	private validateKey(key: SingleKey): boolean {
		const numKeys = Object.keys(key).length;
		let keyName = Object.keys(key)[0];
		if (numKeys === 1) { // validate key length, should only have 1 key in each object
			if (keyName === "AND" || keyName === "OR" || keyName === "NOT") {
				return this.validateLogicKeys(key);
			} else {
				return this.hasOnlyOneKey(key, keyName) &&
					this.isValidFilterKey(keyName) && this.isValidInnerKeyString(key, keyName);
			}
		} else {
			throw new InsightError(`${keyName} should only have 1 key, has ${numKeys}`);
		}
	}

	private hasOnlyOneKey(singleKey: SingleKey, keyName: string): boolean {
		return Object.keys(singleKey[keyName]).length === 1;
	}

	private isValidFilterKey(comparatorKey: string): boolean {
		let isValidFilterKey = whereNumberKeys.includes(comparatorKey) || whereStringKeys.includes(comparatorKey);
		if (isValidFilterKey) {
			return true;
		} else {
			throw new InsightError(`Invalid filter key: ${comparatorKey}`);
		}
	}

	private isValidInnerKeyString(singleKey: SingleKey, keyName: string): boolean {
		const innerKey = Object.keys(singleKey[keyName])[0];
		const keyStr = getStringAfterUnderscore(innerKey);
		if (this.validKindFields.includes(keyStr)) {
			let innerKeyValue = singleKey[keyName][innerKey];
			return this.isValidKeyType(keyName, keyStr, innerKeyValue) && this.isValidValueType(innerKeyValue, keyStr)
				&& this.isQueryingSameDatasetID(innerKey);
		} else {
			throw new InsightError(`Invalid key ${innerKey} in ${keyName}`);
		}
	}

	private isQueryingSameDatasetID(innerKey: string): boolean {
		const queryingDatasetID = getStringBeforeUnderscore(innerKey);
		if (queryingDatasetID === this.queryingDatasetID) {
			return true;
		} else {
			throw new InsightError
			(`Cannot query more than one dataset: ${queryingDatasetID}, ${this.queryingDatasetID}`);
		}
	}

	// e.g. returns true "GT" ("GT": keyName) with "sections_avg" ("avg": keyString);
	// throws error "GT" with "sections_dept".
	private isValidKeyType(keyName: string, keyString: string, innerKeyValue: any): boolean {
		if (whereNumberKeys.includes(keyName)) {
			if (this.validNumberTypes.includes(keyString)) {
				return true;
			} else {
				throw new InsightError(`Invalid key type in ${keyName}`);
			}
		} else if (whereStringKeys.includes(keyName)) {
			if (this.validStringTypes.includes(keyString)) {
				return this.isValidWildcard(innerKeyValue);
			} else {
				throw new InsightError(`Invalid key type in ${keyName}`);
			}
		} else {
			throw new InsightError("UNEXPECTED KEY");
		}
	}

	private isValidValueType(innerKeyValue: any, keyName: string): boolean {
		if (this.validStringTypes.includes(keyName) && typeof  innerKeyValue === "string") {
			return true;
		} else if (this.validNumberTypes.includes(keyName) && typeof innerKeyValue === "number") {
			return true;
		} else {
			throw new InsightError(`Invalid value type in ${keyName}, should be string`);
		}
	}

	private isValidWildcard(innerKeyString: string): boolean {
		if (innerKeyString.length > 1) {
			let count = 0;
			const firstChar = innerKeyString[0];
			const lastChar = innerKeyString[innerKeyString.length - 1];
			for (let char of innerKeyString) {
				if (char === "*") {
					count++;
				}
			}
			if (count === 0) {
				return true;
			} else if (count === 1 && (firstChar === "*" || lastChar === "*")) {
				return true;
			} else if (count === 2 && firstChar === "*" && lastChar === "*") {
				return true;
			} else {
				throw new InsightError("Asterisks (*) can only be the first or last characters of input strings");
			}
		}
		return true;
	}

}
