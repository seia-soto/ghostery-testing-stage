export enum SourceType {
	TrackerDB = 'trackerdb',
	File = 'file',
}

export type BaseSource = {
	type: SourceType;
	url: string;
	filters: string;
	isInitialised: boolean;
};

export type TrackerDb = BaseSource & {
	type: SourceType.TrackerDB;
	files: Array<readonly [string, string]>;
};

export type FileSource = BaseSource & {
	type: SourceType.File;
};

export type Source = TrackerDb | FileSource;
