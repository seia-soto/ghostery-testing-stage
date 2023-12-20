import test from 'ava';
import {readFile} from 'fs/promises';
import path from 'path';
import {getFiltersSectionFromTrackerDefinition} from './trackerdb';

test('get filters section from trackerdb definition', async t => {
	const file = await readFile(path.join(process.cwd(), 'test-resources/one/example.eno'), 'utf8');

	const actual = getFiltersSectionFromTrackerDefinition(file);
	const expected = `||example.test.filter^$3p
||example.test.filter$1p`;

	t.is(actual, expected);
});
