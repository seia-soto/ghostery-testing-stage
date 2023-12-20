/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {type Config} from '../src/modules/config';
import {type EngineContext} from '../src/plugins/engine-manager';

declare module 'fastify' {
	export interface FastifyInstance {
		config: Config;
		engineManager: EngineContext;
	}
}
