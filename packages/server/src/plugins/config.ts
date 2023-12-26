import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {existsSync} from 'fs';
import {readFile, stat} from 'fs/promises';
import path from 'path';
import {parseConfig} from '../modules/config';

const ref = 'config';

const plugin: FastifyPluginAsync = async server => {
	server.log.info({scope: 'plugin:config'}, 'loading');

	if (server.hasDecorator(ref)) {
		server.log.warn({scope: 'plugin:config'}, 'decorator already declared');

		return;
	}

	let configPath = path.join(process.cwd(), 'tss-config.yaml');

	if (process.env.TSS_CONFIG) {
		configPath = process.env.TSS_CONFIG;
	}

	if (
		!existsSync(configPath)
    || !(await stat(configPath)).isFile()
	) {
		server.log.error({scope: 'plugin:config', configPath}, 'file not found');

		process.exit(1);
	}

	const source = await readFile(configPath, 'utf8');
	const [success, data] = parseConfig(source);

	if (!success) {
		for (const error of data) {
			server.log.error({scope: 'plugin:config'}, `${error.message} on ${error.path} but saw`, error.value);
		}

		process.exit(1);
	}

	server.decorate(ref, data);

	server.log.info({scope: 'plugin:config'}, 'done');
};

export const configPlugin = fastifyPlugin(plugin, {
	name: 'config',
});
