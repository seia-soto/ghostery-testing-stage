import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {SourceType, type Source} from '../modules/sources/aatypes';
import {configContextRef} from './config';
import {prepareTrackerDb} from '../modules/sources/trackerdb';

export type SourcesPluginContext = {
	sources: Source[];
	filters: string;
	updatedAt: number;
};

const sourcesContextRef = 'sources';

const buildFilters = (sources: Source[], version: string) => {
	let filters = `! Title: @ghostery/testing-stage
! Expires: 1 hour
! Version: ${version}
`;

	for (const source of sources) {
		filters += `! ${source.type} — ${source.url}
${source.filters}
`;
	}

	return filters;
};

const plugin: FastifyPluginAsync = async server => {
	server.log.info({scope: 'plugin:sources'}, 'loading');

	if (!server.hasDecorator(configContextRef)) {
		server.log.warn({scope: 'plugin:sources'}, '`configPlugin` should be preloaded');

		return;
	}

	if (server.hasDecorator(sourcesContextRef)) {
		server.log.warn({scope: 'plugin:sources'}, 'decorator already declared');

		return;
	}

	const context: SourcesPluginContext = {
		sources: [],
		filters: '',
		updatedAt: 0,
	};

	for (const source of server.config.sources) {
		const type = source.type as SourceType;

		if (type === SourceType.TrackerDB) {
			const item = new Proxy(prepareTrackerDb(source.url), {
				set(target, p, newValue, receiver) {
					Reflect.set(target, p, newValue, receiver);

					if (p !== 'filters') {
						return true;
					}

					server.log.info({scope: 'plugin:sources'}, 'rebuilding filters');

					context.updatedAt = Date.now();
					context.filters = buildFilters(context.sources, context.updatedAt.toString());

					return true;
				},
			});

			context.sources.push(item);
		}
	}

	server.decorate(sourcesContextRef, context);

	server.log.info({scope: 'plugin:sources'}, 'loaded');
};

export const sourcesPlugin = fastifyPlugin(plugin, {
	name: 'sources',
});
