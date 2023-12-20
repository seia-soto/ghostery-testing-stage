import test from 'ava';
import {getConfig} from './config';

test('validate config', async t => {
	t.truthy(getConfig());
	t.throws(() => getConfig({
		bind: {
			address: '127.0.0.1',
			port: 'NaN',
		},
		sources: '',
	}));
});
