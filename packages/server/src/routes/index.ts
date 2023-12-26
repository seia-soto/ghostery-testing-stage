import {type FastifyPluginAsync} from 'fastify';

export const router: FastifyPluginAsync = async server => {
	server.route({
		url: '/updatedAt',
		method: 'get',
		async handler() {
			return {
				updatedAt: server.sources.updatedAt,
			};
		},
	});

	server.route({
		url: '/filters.txt',
		method: 'get',
		async handler() {
			return server.sources.filters;
		},
	});
};
