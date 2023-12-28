import {existsSync} from 'fs';
import {readFile, stat} from 'fs/promises';
import path from 'path';
import * as yaml from 'yaml';

export const readConfig = async () => {
	let configPath = path.join(process.cwd(), 'tss-config.yaml');

	if (process.env.TSS_CONFIG) {
		configPath = process.env.TSS_CONFIG;
	}

	if (
		!existsSync(configPath)
    || !(await stat(configPath)).isFile()
	) {
		throw new Error('Configuration file was not found!');
	}

	const source = await readFile(configPath, 'utf8');

	return yaml.parse(source) as unknown;
};
