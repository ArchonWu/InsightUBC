import {Options, Order} from "../IQueryProcessor";
import {InsightError} from "../IInsightFacade";
import {validOptionsKeys, necessaryOrderKeys} from "../Constants";
import {getStringAfterUnderscore, getStringBeforeUnderscore} from "../Utils";

export class OptionsValidator {
	private readonly optionsBlock: Options;
	private readonly validGroupApplyKeys: string[] | undefined;
	private existingDatasetsIDs: string[];
	private validKindFields: string[] = [];

	constructor(optionsBlock: Options, validGroupApplyKeys: string[] | undefined, existingDatasetsIDs: string[],
		validKindFields: string[]) {
		this.optionsBlock = optionsBlock;
		this.validGroupApplyKeys = validGroupApplyKeys;
		this.existingDatasetsIDs = existingDatasetsIDs;
		this.validKindFields = validKindFields;
	}

	public validateOptionsBlock(): boolean {
		// COLUMNS must exist with length > 0
		if (!this.optionsBlock.COLUMNS) {
			throw new InsightError("OPTIONS missing COLUMNS");
		} else if (this.optionsBlock.COLUMNS.length === 0) {
			throw new InsightError("COLUMNS must be a non-empty array");
		}

		// Check for keys in Options that are not one of "validOptionsKey" ["COLUMNS", "ORDER"]
		Object.keys(this.optionsBlock).forEach((key) => {
			if (!validOptionsKeys.includes(key)) {
				throw new InsightError("Invalid keys in OPTIONS");
			}
		});

		// Check for missing keys in Order (need to have both "validOrderKeys" ["dir", "keys"])
		if (typeof this.optionsBlock.ORDER === "object") {
			const optionsOrderBlock = this.optionsBlock.ORDER as Order;
			const orderKeys = Object.keys(optionsOrderBlock);

			// Check for missing keys ["dir", "keys"] in ORDER
			necessaryOrderKeys.forEach((orderKey) => {
				if (!orderKeys.includes(orderKey)) {
					throw new InsightError(`ORDER missing ${orderKey} key`);
				}
			});

			// Validates the direction designated in "dir", one of ["UP", "DOWN"]
			if (optionsOrderBlock.dir !== "UP" && optionsOrderBlock.dir !== "DOWN") {
				throw new InsightError(`Invalid ORDER direction: ${optionsOrderBlock.dir}`);
			}

			// Check for extra keys in ORDER (keys not one of validOrderKeys ["dir", "keys"])
			orderKeys.forEach((orderKey) => {
				if (!necessaryOrderKeys.includes(orderKey)) {
					throw new InsightError(`Extra keys in ORDER: ${orderKey}`);
				}
			});

			// Validates that every key in ORDER.keys is presented in COLUMNS
			const keys = optionsOrderBlock.keys;
			keys.forEach((key) => {
				if (!this.optionsBlock.COLUMNS.includes(key)) {
					throw new InsightError("All ORDER keys must be in COLUMNS");
				}
			});
		}

		// Validates that the single order key is presented in COLUMNS
		if (typeof this.optionsBlock.ORDER === "string") {
			const optionsKey = this.optionsBlock.ORDER;
			if (!this.optionsBlock.COLUMNS.includes(optionsKey as string)) {
				throw new InsightError("ORDER key must be in COLUMNS");
			}
		}

		return this.validateKeysInColumns();
	}

	// validates each key in COLUMNS, also check this.validGroupApplyKeys in case if Transformations is present
	private validateKeysInColumns(): boolean {
		this.optionsBlock.COLUMNS.forEach((key) => {
			if (this.validGroupApplyKeys
				&& this.validGroupApplyKeys.length > 0 && !this.validGroupApplyKeys.includes(key)) {
				throw new InsightError("Keys in COLUMNS must be in GROUP or APPLY when TRANSFORMATIONS is present");
			} else if ((typeof this.validGroupApplyKeys === "undefined" && !this.isValidInnerKey(key)) ||
				(this.validGroupApplyKeys && this.validGroupApplyKeys.length === 0 && !this.isValidInnerKey(key))) {
				throw new InsightError(`Invalid key ${key} in COLUMNS`);
			}
		});
		return true;
	}

	// Valid innerKey follows the structure of "{existingDataset}_{keyField}"
	// Valid Section innerKey example: "sections_dept"
	private isValidInnerKey(innerKey: string): boolean {
		const queryingDatasetID = getStringBeforeUnderscore(innerKey);
		const queryingSectionField = getStringAfterUnderscore(innerKey);
		const isExistingDataset = this.existingDatasetsIDs.includes(queryingDatasetID);
		const isValidInnerKeyField = this.validKindFields.includes(queryingSectionField);
		return isExistingDataset && isValidInnerKeyField && queryingDatasetID.length > 0;
	}

}
