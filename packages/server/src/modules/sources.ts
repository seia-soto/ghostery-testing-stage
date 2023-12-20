import {readFile} from 'fs/promises';
import path from 'path';
import {type Config} from './config';
import {isDirectory, treeFiles} from './fs';
import {getFiltersFromTrackerDefinitions, getFiltersSectionFromTrackerDbDefinition} from './trackerdb';

// Leave this as enum value so we can extend this function later on.
export enum SourceType {
	TrackerDb = 'trackerdb',
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

export type Source = TrackerDbSource;

/**
 * Read filters from TrackerDB source
 * @param opt The path to TrackerDB
 */
export const getTrackerDbSource = async (opt: string) => {
	const dir = opt.startsWith('/') ? opt : path.join(process.cwd(), opt);

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

	const files = (await treeFiles(dir)).filter(file => file.endsWith('.eno'));
	const filters = await Promise.all(
		files
			.map(async file => getFiltersSectionFromTrackerDbDefinition((await readFile(file, 'utf8')))),
	);

	for (let i = 0; i < files.length; i++) {
		source.definitions.set(files[i], filters[i]);
	}

	console.log(`sources: loaded ${files.length} trackerdb definitions`);

	source.filters = getFiltersFromTrackerDefinitions(source.definitions);

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

		const protocol = line.slice(0, protocolEndsAt) as SourceType;

		if (protocol === SourceType.TrackerDb) {
			// eslint-disable-next-line no-await-in-loop
			sources.push(await getTrackerDbSource(line.slice(protocolEndsAt + 3 /* '://'.length */)));
		}
	}

	return sources;
};
