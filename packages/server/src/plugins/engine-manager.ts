import {FiltersEngine} from '@cliqz/adblocker';
import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {SourceType, getSources, type Source} from '../modules/sources';
import {createTrackerDbWatcher} from '../modules/watcher';

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

	if (server.config.watch.length) {
		for (const source of sources) {
			if (source.type !== SourceType.TrackerDb) {
				continue;
			}

			createTrackerDbWatcher(engine, source);
		}
	}

	server.decorate('engineManager', context);
};

export const engineManagerPlugin = fastifyPlugin(plugin);
