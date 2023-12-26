import {readdir, stat} from 'fs/promises';
import path from 'path';

export const readdirRecursive = async (url: string) => {
	const queue: string[] = [url];
	const files: string[] = [];

	for (; ;) {
		const item = queue.shift();

		if (!item) {
			return files;
		}

		if (!(await stat(item)).isDirectory()) {
			continue;
		}

		const subs = await readdir(item);

		for (const sub of subs) {
			const subPath = path.join(item, sub);
			const subType = await stat(subPath);

			if (subType.isDirectory()) {
				queue.push(subPath);
			} else if (subType.isFile() || subType.isSymbolicLink()) {
				files.push(subPath);
			}
		}
	}
};
