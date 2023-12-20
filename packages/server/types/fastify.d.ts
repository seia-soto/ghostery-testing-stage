/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {type Config} from '../src/modules/config';

declare module 'fastify' {
	export interface FastifyInstance {
		config: Config;
	}
}
