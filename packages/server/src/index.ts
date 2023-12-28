import {TypeBoxValidatorCompiler} from '@fastify/type-provider-typebox';
import fastifyWebsocket from '@fastify/websocket';
import fastify from 'fastify';
import {init} from './modules/init';
import {configPlugin} from './plugins/config';
import {sourcesPlugin} from './plugins/sources';
import {router} from './routes';

export type ServerOptions = {
	config: unknown;
	features?: {
		enableLogging?: boolean;
	};
};

export const createServer = async ({
	config,
	features = {},
}: ServerOptions) => {
	const server = fastify({
		logger: features.enableLogging
			? {
				transport: {
					target: 'pino-pretty',
					options: {
						translateTime: 'HH:MM:ss Z',
						ignore: 'pid,hostname',
					},
				},
			}
			: true,
	})
		.setValidatorCompiler(TypeBoxValidatorCompiler);

	await server.register(configPlugin, {config});
	await server.register(sourcesPlugin, {sources: server.config.sources});

	await server.register(fastifyWebsocket);
	await server.register(router);

	await init(server);

	return server;
};
