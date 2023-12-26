import {type FastifyInstance} from 'fastify';
import {SourceType} from './sources/aatypes';
import {initialiseTrackerDb, watchTrackerDb} from './sources/trackerdb';

const initSources = async (server: FastifyInstance) => {
	for (const source of server.sources.sources) {
		server.log.info({scope: 'init:sources', type: source.type, url: source.url}, 'initialising source');

		if (source.type === SourceType.TrackerDB) {
			await initialiseTrackerDb(source);

			watchTrackerDb(source);
		}
	}
};

export const init = async (server: FastifyInstance) => {
	await initSources(server);
};
