import {TypeBoxValidatorCompiler} from '@fastify/type-provider-typebox';
import fastify from 'fastify';
import {configPlugin} from '../plugins/config';
import {engineManagerPlugin} from '../plugins/engine-manager';
import {router} from './routes';

export const createServer = async () => {
	const server = fastify({
		pluginTimeout: 0,
	})
		.setValidatorCompiler(TypeBoxValidatorCompiler);

	await server.register(configPlugin);
	await server.register(engineManagerPlugin);

	await server.register(router, {prefix: '/api'});

	return server;
};
