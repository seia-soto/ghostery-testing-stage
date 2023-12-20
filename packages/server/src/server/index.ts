import {TypeBoxValidatorCompiler} from '@fastify/type-provider-typebox';
import fastify from 'fastify';
import {configPlugin} from '../plugins/config';
import {router} from './routes';

export const createServer = async () => {
	const server = fastify()
		.setValidatorCompiler(TypeBoxValidatorCompiler);

	await server.register(configPlugin);
	await server.register(router, {prefix: '/api'});

	return server;
};
