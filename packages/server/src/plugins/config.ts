import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {getConfig} from '../modules/config';

const plugin: FastifyPluginAsync = async server => {
	if (server.hasDecorator('config')) {
		return;
	}

	const config = getConfig();

	server.decorate('config', config);
};

export const configPlugin = fastifyPlugin(plugin);
