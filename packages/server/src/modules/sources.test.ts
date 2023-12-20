import test from 'ava';
import {type TrackerDbSource, getSources} from './sources';

test('get sources', async t => {
	t.is((await getSources('')).length, 0);

	const [source] = await getSources('trackerdb://./test-resources/one') as [TrackerDbSource];

	t.is(source.filters.split('\n').slice(1).join('\n'), `||example.test.filter^$3p
||example.test.filter$1p
`);
});
