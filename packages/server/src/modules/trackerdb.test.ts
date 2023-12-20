import test from 'ava';
import {getFiltersSectionFromTrackerDbDefinition} from './trackerdb';

const sample = `
name: Example
category: unknown
website_url: http://example.org
organization: example

--- domains
example.org
--- domains

--- filters
||example.test.filter^$3p
||example.test.filter$1p
--- filters

ghostery_id: 000`;

test('get filters section from trackerdb definition', async t => {
	const actual = getFiltersSectionFromTrackerDbDefinition(sample);
	const expected = `||example.test.filter^$3p
||example.test.filter$1p`;

	t.is(actual, expected);
});
