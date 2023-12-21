import {readFile} from 'fs/promises';
import got from 'got';
import path from 'path';
import {type Config} from './config';
import {isDirectory, treeFiles} from './fs';
import {getFiltersFromTrackerDefinitions, getFiltersSectionFromTrackerDefinition, isTrackerDefinition} from './trackerdb';
import {getBuffer} from './request';
import {FiltersEngine} from '@cliqz/adblocker';

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

export const getFilterListSource = async (url: string) => {
	console.log(`sources: loading filter list path=${url}`);

	const source: FilterListSource = {
		type: SourceType.FilterList,
		filters: '',
		url,
	};

	const response = await got(url);

	source.filters = response.body;

	return source;
};

export const getGhosteryEngineSource = async (url: string) => {
	console.log(`sources: loading Ghostery engine path=${url}`);

	const source: FilterListSource = {
		type: SourceType.FilterList,
		filters: '',
		url,
	};

	const buffer = await getBuffer(url);
	const engine = FiltersEngine.deserialize(buffer);
	const filters = engine.getFilters();

	for (const {rawLine} of filters.cosmeticFilters) {
		source.filters += rawLine + '\n';
	}

	for (const {rawLine} of filters.networkFilters) {
		source.filters += rawLine + '\n';
	}

	return source;
};

export type GhosteryEngine = {
	url: string;
	checksum: string;
};

export type GhosteryList = {
	url: string;
	checksum: string;
	diffs: Record<string, string>;
};

export type GhosteryResources = {
	name: string;
	engines: Record<string, GhosteryEngine>;
	lists: Record<string, GhosteryList>;
};

export const getGhosteryList = async (url: string) => {
	console.log(`sources: loading Ghostery resources path=${url}`);

	const response = await got(url);
	const data = JSON.parse(response.body) as GhosteryResources;

	const sources: Source[] = [];

	const latestVersion = Object.keys(data.engines).reduce((state, version) => {
		const versionNumber = parseInt(version, 10);

		if (versionNumber > state) {
			return versionNumber;
		}

		return state;
	}, 0);

	sources.push(await getGhosteryEngineSource(data.engines[latestVersion.toString()].url));

	for (const [, {url}] of Object.entries(data.lists)) {
		// eslint-disable-next-line no-await-in-loop
		sources.push(await getFilterListSource(url));
	}

	return sources;
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

		// eslint-disable-next-line default-case
		switch (protocol) {
			case 'db':
			case 'trackerdb': {
				// eslint-disable-next-line no-await-in-loop
				sources.push(await getTrackerDbSource(opt));

				break;
			}

			case 'http':
			case 'https': {
				// eslint-disable-next-line no-await-in-loop
				sources.push(await getFilterListSource('http://' + opt));

				break;
			}

			case 'adblocker':
			case 'engine':
			case 'ghostery': {
				// eslint-disable-next-line no-await-in-loop
				sources.push(await getGhosteryEngineSource('http://' + opt));

				break;
			}

			case 'list': {
				// eslint-disable-next-line no-await-in-loop
				sources.push(...await getGhosteryList('http://' + opt));

				break;
			}
		}
	}

	return sources;
};
