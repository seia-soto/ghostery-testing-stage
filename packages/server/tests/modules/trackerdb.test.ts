import test from 'ava';
import {readFile} from 'fs/promises';
import path from 'path';
import {getFiltersSection} from '../../src/modules/trackerdb';

test('trackerdb.getFiltersSection', async t => {
	const content = await readFile(path.join(process.cwd(), 'tests/resources/example.eno'), 'utf8');

	t.is(getFiltersSection(content), `||example.test.filter^$3p
||example.test.filter$1p`);
});
