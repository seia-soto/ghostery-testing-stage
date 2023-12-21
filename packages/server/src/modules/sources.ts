import {readFile} from 'fs/promises';
import got from 'got';
import path from 'path';
import {type Config} from './config';
import {isDirectory, treeFiles} from './fs';
import {getFiltersFromTrackerDefinitions, getFiltersSectionFromTrackerDefinition, isTrackerDefinition} from './trackerdb';

// Leave this as enum value so we can extend this function later on.
export enum SourceType {
	TrackerDb,
	FilterList,
}

export type BaseSource = {
	type: SourceType;
	filters: string;
};

export type TrackerDbSource = BaseSource & {
	type: SourceType.TrackerDb;
	path: string; // (await import('node:path')).join(process.cwd(), path)
	definitions: Map<string, string>;
};

export type FilterListSource = BaseSource & {
	type: SourceType.FilterList;
	url: string;
};

export type Source = TrackerDbSource | FilterListSource;

/**
 * Read filters from TrackerDB source
 * @param opt The path to TrackerDB
 */
export const getTrackerDbSource = async (opt: string) => {
	const dir = opt.startsWith('/') ? opt : path.join(process.cwd(), opt);

	console.log(`sources: loading trackerdb path=${dir}`);

	if (!await isDirectory(dir)) {
		console.error('sources(trackerdb): invalid path to the directory', dir);

		throw new Error('Failed to validate TrackerDB path!');
	}

	const source: TrackerDbSource = {
		type: SourceType.TrackerDb,
		path: dir,
		filters: '',
		definitions: new Map(),
	};

	const files = (await treeFiles(dir)).filter(isTrackerDefinition);
	const filters = await Promise.all(
		files
			.map(async file => getFiltersSectionFromTrackerDefinition((await readFile(file, 'utf8')))),
	);

	for (let i = 0; i < files.length; i++) {
		source.definitions.set(files[i], filters[i]);
	}

	source.filters = getFiltersFromTrackerDefinitions(source.definitions);

	return source;
};

export const getFilterListSource = async (opt: string) => {
	const source: FilterListSource = {
		type: SourceType.FilterList,
		filters: '',
		url: opt,
	};

	const response = await got(opt, {
		headers: {
			'user-agent': '@ghostery/testing-stage',
		},
		followRedirect: true,
	});

	source.filters = response.body;

	console.log(`sources: loaded filter list path=${opt}`);

	return source;
};

/**
 * Parse comma-spread sources and transform into object entries
 * @param text The comma-spread list of sources
 */
export const getSources = async (text: Config['sources'], delimiter = ','): Promise<Source[]> => {
	const sources: Source[] = [];

	for (const line of text.split(delimiter)) {
		const protocolEndsAt = line.indexOf('://');

		if (protocolEndsAt < 0) {
			continue;
		}

		const protocol = line.slice(0, protocolEndsAt);
		const opt = line.slice(protocolEndsAt + 3 /* '://'.length */);

		if (protocol === 'trackerdb') {
			// eslint-disable-next-line no-await-in-loop
			sources.push(await getTrackerDbSource(opt));
		} else if (protocol === 'http' || protocol === 'https') {
			// eslint-disable-next-line no-await-in-loop
			sources.push(await getFilterListSource(opt));
		}
	}

	return sources;
};
