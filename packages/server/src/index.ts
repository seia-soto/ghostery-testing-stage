import fastify from 'fastify';
import {configPlugin} from './plugins/config';

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

	return server;
};
