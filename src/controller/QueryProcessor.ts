import {Order, QueryObject} from "./IQueryProcessor";
import Section from "./Section";
import {InsightDatasetKind, InsightResult} from "./IInsightFacade";
import Dataset from "./Dataset";
import WhereProcessor from "./Processors/WhereProcessor";
import TransformationsProcessor from "./Processors/TransformationsProcessor";
import OptionsProcessor from "./Processors/OptionsProcessor";
import Room from "./Room";

export default class QueryProcessor {
	private readonly dataset: Dataset;
	private whereProcessor: WhereProcessor;
	private optionsProcessor: OptionsProcessor;
	private transformationsProcessor: TransformationsProcessor;

	constructor(dataList: Section[] | Room[], queryingDatasetKind: InsightDatasetKind | undefined) {
		if (queryingDatasetKind === undefined) {
			this.dataset = new Dataset(InsightDatasetKind.Sections);
		} else {
			this.dataset = new Dataset(queryingDatasetKind);
		}
		this.dataset.addDatasetData(dataList, queryingDatasetKind);
		this.whereProcessor = new WhereProcessor(this.dataset);
		this.optionsProcessor = new OptionsProcessor(this.dataset.getDatasetKind());
		this.transformationsProcessor = new TransformationsProcessor();
	}

	// Assumes correctly formatted (QueryValidator.isValid) query.
	public processQuery(query: QueryObject, allDatasetDataList: Section[] | Room[]): InsightResult[] {
		let resultSections = allDatasetDataList;
		if (query.WHERE) {
			resultSections = this.whereProcessor.handleWhere(query.WHERE, allDatasetDataList);
		}
		if (query.OPTIONS && !query.TRANSFORMATIONS) {
			return this.optionsProcessor.handleOptionsSimple(query.OPTIONS, resultSections);
		} else if (query.OPTIONS && query.TRANSFORMATIONS) {
			const transformationsBlock = query.TRANSFORMATIONS;
			const columns = query.OPTIONS.COLUMNS;
			let insightResultSections =
				this.transformationsProcessor.handleTransformations(transformationsBlock,
					columns, resultSections);
			return this.optionsProcessor.handleOrderTransformed(query.OPTIONS.ORDER as Order, insightResultSections);
		}
		return [];
	}

}
