import {type FastifyPluginAsync} from 'fastify';

export const router: FastifyPluginAsync = async server => {
	server.route({
		url: '/health',
		method: 'get',
		handler() {
			return 'healty';
		},
	});

	server.route({
		url: '/engine.bytes',
		method: 'get',
		handler() {
			return server.engineManager.engine.serialize();
		},
	});

	server.route({
		url: '/filters.txt',
		method: 'get',
		handler() {
			return `! Title: @ghostery/testing-stage
! Expires: 1 hour
! Version: ${Date.now()}

${server.engineManager.sources.map(source => source.filters).join('\n')}`;
		},
	});
};
