import EventEmitter from 'eventemitter3';
import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {type Config} from '../modules/config';
import {SourceType, type Source} from '../modules/sources/aatypes';
import {prepareFileSource} from '../modules/sources/file';
import {prepareTrackerDb} from '../modules/sources/trackerdb';

export type SourcesPluginContext = {
	sources: Source[];
	filters: string;
	updatedAt: number;
	events: EventEmitter;
};

export type SourcesPluginOptions = {
	sources: Config['sources'];
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

const plugin: FastifyPluginAsync<SourcesPluginOptions> = async (server, {sources = []}) => {
	server.log.info({scope: 'plugin:sources'}, 'loading');

	if (server.hasDecorator(sourcesContextRef)) {
		server.log.warn({scope: 'plugin:sources'}, 'decorator already declared');

		return;
	}

	const context: SourcesPluginContext = {
		sources: [],
		filters: '',
		updatedAt: 0,
		events: new EventEmitter(),
	};

	const makeProxy = (source: Source) => new Proxy(source, {
		set(target, p, newValue, receiver) {
			Reflect.set(target, p, newValue, receiver);

			if (p !== 'filters') {
				return true;
			}

			server.log.info({scope: 'plugin:sources'}, 'rebuilding filters');

			context.updatedAt = Date.now();
			context.filters = buildFilters(context.sources, context.updatedAt.toString());

			context.events.emit('filters:update');

			return true;
		},
	});

	for (const source of sources) {
		const type = source.type as SourceType;

		if (type === SourceType.TrackerDB) {
			context.sources.push(makeProxy(prepareTrackerDb(source.url)));
		} else if (type === SourceType.File) {
			context.sources.push(makeProxy(prepareFileSource(source.url)));
		}
	}

	server.decorate(sourcesContextRef, context);

	server.log.info({scope: 'plugin:sources'}, 'loaded');
};

export const sourcesPlugin = fastifyPlugin(plugin, {
	name: 'sources',
});
