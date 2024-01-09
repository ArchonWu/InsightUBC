import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import {QueryObject} from "./IQueryProcessor";
import {OptionsValidator} from "./Validators/OptionsValidator";
import {TransformationsValidator} from "./Validators/TransformationsValidator";
import WhereValidator from "./Validators/WhereValidator";
import {getStringBeforeUnderscore} from "./Utils";
import {
	roomsNumberTypes,
	roomsStringTypes,
	sectionsNumberTypes,
	sectionsStringTypes,
	validRoomsFields,
	validSectionFields
} from "./Constants";

export default class QueryValidator {
	private existingDatasetsIDs: string[] = [];
	private queryingDatasetID: string = "";
	private transformationsValidator: TransformationsValidator | undefined;
	private whereValidator: WhereValidator | undefined;
	private optionsValidator: OptionsValidator | undefined;
	private validNumberTypes: string[] = [];
	private validStringTypes: string[] = [];
	private validKindFields: string[] = [];
	private queryingDatasetKind: InsightDatasetKind = InsightDatasetKind.Sections;

	constructor(existingDatasetsIDs: string[]) {
		this.existingDatasetsIDs = existingDatasetsIDs;
	}

	public isValidQuery(queryObject: unknown, queryingDatasetKind: InsightDatasetKind | undefined): boolean {
		this.setQueryingDatasetKind(queryingDatasetKind);
		let isValidJsonObject = this.parseIntoJsonObject(queryObject);
		let jsonQuery = this.parseIntoJsonObject(queryObject);
		let isValidJsonQuery = this.isValidJsonQuery(jsonQuery);
		return isValidJsonObject && isValidJsonQuery;
	}

    // Takes in an unknown query object, and checks if it can be parsed into a json object.
	public parseIntoJsonObject(queryObject: unknown): JSON {
		try {
			return JSON.parse(JSON.stringify(queryObject));
		} catch (error) {
			throw new InsightError("Invalid query string");
		}
	}

    // Assume correctly parsed JSON object.
	private isValidJsonQuery(queryJsonObject: JSON): boolean {
		const queryObject = queryJsonObject as QueryObject;

        // "TRANSFORMATIONS":
		const transformationsBlock = queryObject.TRANSFORMATIONS;
		let isValidTransformationsBlock = true;	// default transformations block not present
		let validGroupApplyKeys: string[] | undefined;
		if (transformationsBlock) {
			this.transformationsValidator =
				new TransformationsValidator(transformationsBlock,
					this.validNumberTypes, this.validStringTypes, this.queryingDatasetKind);
			isValidTransformationsBlock =
				this.transformationsValidator.validateTransformationsBlock(transformationsBlock);
			validGroupApplyKeys = this.transformationsValidator?.getValidGroupApplyKeys();
			this.queryingDatasetID = this.transformationsValidator.getQueryingDatasetID();
		}

        // "OPTIONS":
		const optionsBlock = queryObject.OPTIONS;
		if (!optionsBlock) {
			throw new InsightError("Missing OPTIONS");
		}

		this.optionsValidator = new OptionsValidator(optionsBlock, validGroupApplyKeys, this.existingDatasetsIDs,
			this.validKindFields);
		const isValidOptionsBlock = this.optionsValidator.validateOptionsBlock();

        // set this.queryingDatasetID from the first item in COLUMNS (since COLUMNS must exist in a query)
		// if this.queryingDatasetID is not empty, then this.queryingDatasetID is already obtained from TRANSFORMATIONS
		if (this.queryingDatasetID === "") {
			this.queryingDatasetID = getStringBeforeUnderscore(optionsBlock.COLUMNS[0]);
		}

        // "WHERE":
		const whereBlock = queryObject.WHERE;
		let isValidWhereBlock = false;
		if (!whereBlock) {
			throw new InsightError("Missing WHERE");
		} else {
			this.whereValidator = new WhereValidator(this.queryingDatasetID,
				this.validNumberTypes, this.validStringTypes, this.validKindFields);
			isValidWhereBlock = this.whereValidator.validateWhereBlock(whereBlock);
		}

		return isValidWhereBlock && isValidOptionsBlock && isValidTransformationsBlock;
	}

	public getQueryingDatasetIdFromColumnsOrApply(queryObject: QueryObject): string {
		const columns = queryObject.OPTIONS?.COLUMNS;
		if (!columns || !columns[0]) {
			throw new InsightError("OPTIONS missing COLUMNS");
		} else {
			const queryingDatasetIdFromColumns = getStringBeforeUnderscore(columns[0]);
			if (queryingDatasetIdFromColumns.length === 0) {	// no valid id from COLUMNS (only aggregation names)
				// find queryingDatasetID from APPLY, since the aggregation key must be in APPLY
				const applyBlock = queryObject.TRANSFORMATIONS?.APPLY;
				if (applyBlock) {
					const innerObject = applyBlock[0];
					const innerKey = Object.keys(innerObject)[0];
					const innerValue = innerObject[innerKey];
					const innerInnerValue = Object.values(innerValue)[0];
					return getStringBeforeUnderscore(innerInnerValue as string);
				} else {
					throw new InsightError("Invalid APPLY");
				}
			} else {
				return queryingDatasetIdFromColumns;
			}
		}
	}

	private setQueryingDatasetKind(datasetKind: InsightDatasetKind | undefined): void {
		if (datasetKind === InsightDatasetKind.Sections) {
			this.queryingDatasetKind = datasetKind;
			this.validNumberTypes = sectionsNumberTypes;
			this.validStringTypes = sectionsStringTypes;
			this.validKindFields = validSectionFields;
		} else if (datasetKind === InsightDatasetKind.Rooms) {
			this.queryingDatasetKind = datasetKind;
			this.validNumberTypes = roomsNumberTypes;
			this.validStringTypes = roomsStringTypes;
			this.validKindFields = validRoomsFields;
		}
	}

}
