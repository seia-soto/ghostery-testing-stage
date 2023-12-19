import {type FastifyPluginAsync} from 'fastify';

export const router: FastifyPluginAsync = async server => {
	server.route({
		url: '/health',
		method: 'get',
		handler() {
			return 'healty';
		},
	});
};
