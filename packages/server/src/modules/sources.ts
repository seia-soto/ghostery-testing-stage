import {readFile} from 'fs/promises';
import {type Config} from './config';
import {isDirectory, treeFiles} from './fs';
import {getFiltersSectionFromTrackerDbDefinition} from './trackerdb';

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
	if (!await isDirectory(opt)) {
		console.error('sources(trackerdb): invalid path to the directory', opt);

		throw new Error('Failed to validate TrackerDB path!');
	}

	const source: TrackerDbSource = {
		type: SourceType.TrackerDb,
		path: opt,
		filters: '',
		definitions: new Map(),
	};

	Object.defineProperty(source, 'filters', {
		get() {
			let filters = '';

			for (const entry of source.definitions.entries()) {
				filters += entry[1] + '\n';
			}

			return filters;
		},
	});

	const files = await treeFiles(opt);
	const filters = await Promise.all(files.map(async file => getFiltersSectionFromTrackerDbDefinition((await readFile(file, 'utf8')))));

	for (let i = 0; i < files.length; i++) {
		source.definitions.set(files[i], filters[i]);
	}

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
