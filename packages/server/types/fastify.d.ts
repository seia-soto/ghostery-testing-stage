import {type Config} from '../src/modules/config';

/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module 'fastify' {
	interface FastifyInstance {
		config: Config;
	}
}
