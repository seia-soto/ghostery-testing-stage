import {TypeBoxValidatorCompiler} from '@fastify/type-provider-typebox';
import fastifyWebsocket from '@fastify/websocket';
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
	})
		.setValidatorCompiler(TypeBoxValidatorCompiler);

	await server.register(configPlugin);
	await server.register(sourcesPlugin);

	await server.register(fastifyWebsocket);
	await server.register(router);

	await init(server);

	return server;
};
