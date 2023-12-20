import {type TrackerDbSource} from './sources';

export const isTrackerDefinition = (filename: string) => filename.endsWith('.eno');

const delimiter = '--- filters';

export const getFiltersSectionFromTrackerDefinition = (text: string) => {
	const start = text.indexOf(delimiter);

	if (start < 0) {
		return '';
	}

	const actualStart = start + 12; /* Delimiter.length + 1 */
	const end = text.indexOf(delimiter, actualStart);

	if (end < 0) {
		// Invalid file format
		return '';
	}

	// Avoid including additional line break
	return text.slice(actualStart, end - 1);
};

export const getFiltersFromTrackerDefinitions = (definitions: TrackerDbSource['definitions']) => {
	let contents = '';

	console.time('trackerdb: build filters');

	for (const [filename, filters] of definitions.entries()) {
		contents += `! ${filename}
${filters}
`;
	}

	console.timeEnd('trackerdb: build filters');

	return contents;
};
