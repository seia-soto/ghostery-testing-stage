import {existsSync} from 'fs';
import {readFile, stat} from 'fs/promises';
import path from 'path';
import * as yaml from 'yaml';

const isFile = async (location: string) => {
	if (!existsSync(location)) {
		return false;
	}

	return (await stat(location)).isFile();
};

const findConfig = async () => {
	if (process.env.TSS_CONFIG) {
		return process.env.TSS_CONFIG;
	}

	const cwd = process.cwd();
	let location = path.join(cwd, 'tss-config.yaml');

	if (await isFile(location)) {
		return location;
	}

	location = path.join(cwd, 'tss-config.yml');

	if (await isFile(location)) {
		return location;
	}

	throw new Error('config: failed to find the location of config file!');
};

export const readConfig = async () => {
	const source = await readFile(await findConfig(), 'utf8');

	return yaml.parse(source) as unknown;
};
