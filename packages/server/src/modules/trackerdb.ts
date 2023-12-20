import {type TrackerDbSource} from './sources';

const delimiter = '--- filters';

export const getFiltersSectionFromTrackerDbDefinition = (text: string) => {
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

	for (const [filename, filters] of definitions.entries()) {
		contents += `! ${filename}
${filters}
`;
	}

	return contents;
};
