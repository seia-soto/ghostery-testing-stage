const delimiter = '--- filters';

export const getFiltersSectionFromTrackerDbDefinition = async (text: string) => {
	const start = text.indexOf(delimiter);

	if (start < 0) {
		return '';
	}

	const end = text.indexOf(delimiter, start + 1);

	if (end < 0) {
		// Invalid eno file
		return '';
	}

	return text.slice(start + 12 /* delimiter.length + 1 */, end);
};
