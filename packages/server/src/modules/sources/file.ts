import {readFile, stat} from 'fs/promises';
import chokidar from 'chokidar';
import {type FileSource, SourceType} from './aatypes';
import path from 'path';

export const prepareFileSource = (url: string): FileSource => ({
	type: SourceType.File,
	url,
	filters: '',
});

export const initialiseFileSource = async (source: FileSource) => {
	if (source.url.startsWith('.')) {
		source.url = path.join(process.cwd(), source.url.slice(1));
	}

	if (!(await stat(source.url)).isFile()) {
		throw new Error('The source.url of FileSource should be file!');
	}

	source.filters = await readFile(source.url, 'utf8');
};

export const watchFileSource = async (source: FileSource) => {
	const watcher = chokidar.watch(source.url, {
		persistent: true,
		ignoreInitial: true,
		disableGlobbing: true,
	});

	return new Promise<void>(resolve => {
		watcher
			.once('ready', () => {
				resolve();
			})
			.on('all', async event => {
				if (event === 'add' || event === 'change') {
					source.filters = await readFile(source.url, 'utf8');
				}
			});
	});
};
