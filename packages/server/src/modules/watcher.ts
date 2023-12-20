import {type FiltersEngine} from '@cliqz/adblocker';
import chokidar from 'chokidar';
import {readFile} from 'fs/promises';
import {type TrackerDbSource} from './sources';
import {getFiltersFromTrackerDefinitions, getFiltersSectionFromTrackerDefinition, isTrackerDefinition} from './trackerdb';

export const createTrackerDbWatcher = (engine: FiltersEngine, source: TrackerDbSource) => {
	const watcher = chokidar.watch(source.path, {
		ignored: /.*\.[^e]?[^n]?[^o]?$/,
		persistent: true,
		ignoreInitial: true,
	});

	const handleAdd = async (path: string) => {
		if (!isTrackerDefinition(path)) {
			return;
		}

		console.log('watcher: update', path);

		const oldFilters: string[] = [];
		const newFilters = getFiltersSectionFromTrackerDefinition(await readFile(path, 'utf8'));

		if (source.definitions.has(path)) {
			oldFilters.push(source.definitions.get(path)!);
		}

		source.definitions.set(path, newFilters);
		source.filters = getFiltersFromTrackerDefinitions(source.definitions);

		engine.updateFromDiff({added: [newFilters], removed: oldFilters});
	};

	watcher
		.on('ready', () => {
			console.log('watcher: keeping eyes on', source.path);
		})
		.on('unlink', path => {
			if (!source.definitions.has(path)) {
				return;
			}

			console.log('watcher: unlink', path);

			source.definitions.delete(path);
			source.filters = getFiltersFromTrackerDefinitions(source.definitions);

			engine.updateFromDiff({removed: [source.definitions.get(path)!]});
		})
		.on('unlinkDir', async path => {
			const oldFilters: string[] = [];

			for (const key of source.definitions.keys()) {
				if (key.startsWith(path)) {
					oldFilters.push(source.definitions.get(key)!);
					source.definitions.delete(key);
				}
			}

			if (!oldFilters.length) {
				return;
			}

			console.log('watcher: unlinkDir', path);

			source.filters = getFiltersFromTrackerDefinitions(source.definitions);

			engine.updateFromDiff({removed: oldFilters});
		})
		.on('add', handleAdd)
		.on('change', handleAdd);
};
