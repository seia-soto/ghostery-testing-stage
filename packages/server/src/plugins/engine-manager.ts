import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {FiltersEngine} from '@cliqz/adblocker';
import {type Source, getSources} from '../modules/sources';

export type EngineContext = {
	engine: FiltersEngine;
	sources: Source[];
};

const plugin: FastifyPluginAsync = async server => {
	if (!server.hasDecorator('config')) {
		throw new Error('Engine Manager Plugin should be loaded after config plugin!');
	}

	if (server.hasDecorator('engineManager')) {
		return;
	}

	const engine = FiltersEngine.empty();
	const sources = await getSources(server.config.sources);

	const context: EngineContext = {
		engine,
		sources,
	};

	for (const source of sources) {
		engine.updateFromDiff({added: [source.filters]});
	}

	server.decorate('engineManager', context);
};

export const engineManagerPlugin = fastifyPlugin(plugin);
