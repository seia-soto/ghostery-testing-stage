import fastify from 'fastify';
import {init} from './modules/init';
import {configPlugin} from './plugins/config';
import {sourcesPlugin} from './plugins/sources';
import {router} from './routes';

export const createServer = async () => {
	const server = fastify({
		logger: {
			transport: {
				target: 'pino-pretty',
				options: {
					translateTime: 'HH:MM:ss Z',
					ignore: 'pid,hostname',
				},
			},
		},
	});

	await server.register(configPlugin);
	await server.register(sourcesPlugin);

	await init(server);

	await server.register(router);

	return server;
};
