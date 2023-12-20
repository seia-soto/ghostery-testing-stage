import {type FastifyPluginAsync} from 'fastify';
import {getConfig} from '../modules/config';

export const configPlugin: FastifyPluginAsync = async server => {
	if (server.hasDecorator('config')) {
		return;
	}

	server.decorate('config', getConfig());
};
