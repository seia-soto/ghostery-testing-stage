import {readFile, readdir, stat} from 'fs/promises';
import path from 'path';

export const isDirectory = async (dir: string) => (await stat(dir)).isDirectory();

export const treeFiles = async (root: string) => {
	const dirs = [root];
	const files: string[] = [];

	for (; ;) {
		const dir = dirs.shift();

		if (!dir) {
			return files;
		}

		// eslint-disable-next-line no-await-in-loop
		const list = await readdir(root);

		for (const item of list) {
			const fullpath = path.join(dir, item);
			// eslint-disable-next-line no-await-in-loop
			const entity = await stat(fullpath);

			if (entity.isDirectory()) {
				dirs.push(fullpath);
			} else if (entity.isFile()) {
				files.push(fullpath);
			}
		}
	}
};
