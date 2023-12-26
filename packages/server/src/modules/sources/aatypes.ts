export enum SourceType {
	TrackerDB = 'trackerdb',
}

export type SourceWatcher = {
	files: Array<readonly [string, string]>;
	isActive: boolean;
};

export type BaseSource = {
	type: SourceType;
	url: string;
	filters: string;
	isInitialised: boolean;
};

export type TrackerDb = BaseSource & {
	type: SourceType.TrackerDB;
	watcher: SourceWatcher;
};

export type Source = TrackerDb;
