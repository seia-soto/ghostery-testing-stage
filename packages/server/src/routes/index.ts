import {type FastifyPluginAsync} from 'fastify';

export const router: FastifyPluginAsync = async server => {
	server.route({
		url: '/',
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

	server.route({
		url: '/events',
		method: 'get',
		handler() {
			return '';
		},
		wsHandler(connection, request) {
			connection.setEncoding('utf8');
			connection.write({});

			server.sources.events.on('filters:update', () => {
				connection.socket.send(JSON.stringify({type: 'filters:update'}));
			});
		},
	});
};
