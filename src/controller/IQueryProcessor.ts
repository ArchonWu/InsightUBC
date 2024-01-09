export interface QueryObject {
	WHERE?: SingleKey;
	OPTIONS?: Options;
	TRANSFORMATIONS?: Transformations;
}

export interface SingleKey {
	[key: string]: {
		[innerKey: string]: any;
	};
}

export interface Options {
	COLUMNS: string[];
	ORDER?: string | Order;
}

export interface Order {
	dir: string;
	keys: string[];
}

export interface Transformations {
	GROUP: string[];
	APPLY?: SingleKey[];
}
