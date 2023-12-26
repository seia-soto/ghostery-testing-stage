import {type FastifyInstance} from 'fastify';
import {SourceType} from './sources/aatypes';
import {initialiseFileSource, watchFileSource} from './sources/file';
import {initialiseTrackerDb, watchTrackerDb} from './sources/trackerdb';

const initSources = async (server: FastifyInstance) => {
	for (const source of server.sources.sources) {
		server.log.info({scope: 'init:sources', type: source.type, url: source.url}, 'initialising source');

		if (source.type === SourceType.TrackerDB) {
			await initialiseTrackerDb(source);
			await watchTrackerDb(source);
		} else if (source.type === SourceType.File) {
			await initialiseFileSource(source);
			await watchFileSource(source);
		}
	}
};

export const init = async (server: FastifyInstance) => {
	await initSources(server);
};
