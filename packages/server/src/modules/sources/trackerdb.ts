import chokidar from 'chokidar';
import {readFile} from 'fs/promises';
import {readdirRecursive} from '../fs';
import {getFiltersSection} from '../trackerdb';
import {SourceType, type TrackerDb} from './aatypes';

export const prepareTrackerDb = (url: string): TrackerDb => ({
	type: SourceType.TrackerDB,
	url,
	filters: '',
	watcher: {
		files: [],
		isActive: false,
	},
	isInitialised: false,
});

export const initialiseTrackerDb = async (source: TrackerDb) => {
	const files = await Promise.all(
		(await readdirRecursive(source.url))
			.filter(file => file.endsWith('.eno'))
			.map(async file => [file, getFiltersSection(await readFile(file, 'utf8'))] as const),
	);

	source.filters = files.map(file => file[1]).join('\n');
	source.watcher.files = files;

	source.isInitialised = true;
};

export const watchTrackerDb = (source: TrackerDb) => {
	const watcher = chokidar.watch(source.url, {
		persistent: true,
		ignoreInitial: true,
		disableGlobbing: true,
	});

	watcher
		.once('ready', () => {
			source.watcher.isActive = true;
		})
		.on('all', async (event, file) => {
			if (!file.endsWith('.eno')) {
				return;
			}

			if (event === 'add') {
				const item = [file, getFiltersSection(await readFile(file, 'utf8'))] as const;

				source.watcher.files.push(item);

				// Append
				source.filters += '\n' + item[1];
			} else if (event === 'change') {
				let offset = 0;

				for (const [name, content] of source.watcher.files) {
					const newContent = getFiltersSection(await readFile(file, 'utf8'));

					if (name === file) {
						source.filters = source.filters.slice(0, offset) + newContent + source.filters.slice(offset + content.length);

						break;
					}

					offset += content.length + 1;
				}
			} else if (event === 'unlink') {
				let offset = 0;

				for (const [name, content] of source.watcher.files) {
					if (name === file) {
						source.filters = source.filters.slice(0, offset) + source.filters.slice(offset + content.length + 1);

						break;
					}

					offset += content.length + 1;
				}
			} else if (event === 'unlinkDir') {
				let offset = 0;

				for (const [name, content] of source.watcher.files) {
					if (name === file) {
						source.filters = source.filters.slice(0, offset) + source.filters.slice(offset + content.length + 1);

						continue;
					}

					offset += content.length + 1;
				}
			}
		});
};
