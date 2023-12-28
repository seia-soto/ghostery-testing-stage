import {type ServerOptions} from '../src';
import {type Config} from '../src/modules/config';
import {type SourcesPluginContext} from '../src/plugins/sources';

/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare module 'fastify' {
	interface FastifyInstance {
		config: Config;
		features: ServerOptions['features'];
		sources: SourcesPluginContext;
	}
}
