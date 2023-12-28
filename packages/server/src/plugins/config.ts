import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {validateConfig} from '../modules/config';

export const configContextRef = 'config';

export type ConfigPluginOptions = {
	config: unknown;
};

const plugin: FastifyPluginAsync<ConfigPluginOptions> = async (server, {config}) => {
	server.log.info({scope: 'plugin:config'}, 'loading');

	if (server.hasDecorator(configContextRef)) {
		server.log.warn({scope: 'plugin:config'}, 'decorator already declared');

		return;
	}

	const [success, data] = validateConfig(config);

	if (!success) {
		for (const error of data) {
			server.log.error({scope: 'plugin:config'}, `${error.message} on ${error.path} but saw`, error.value);
		}

		process.exit(1);
	}

	server.decorate(configContextRef, data);

	server.log.info({scope: 'plugin:config', config: data}, 'loaded');
};

export const configPlugin = fastifyPlugin(plugin, {
	name: 'config',
});
