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
