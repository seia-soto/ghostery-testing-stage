const filtersSectionKeyword = '--- filters';

/**
 * Extract `filters` section of given eno file content.
 * @param source The source of eno file.
 * @returns `filters` section of eno file.
 */
export const getFiltersSection = (source: string) => {
	let startsAt = source.indexOf(filtersSectionKeyword);

	if (startsAt < 0) {
		return '';
	}

	startsAt += filtersSectionKeyword.length + 1;

	const endsAt = source.indexOf(filtersSectionKeyword, startsAt);

	return source.slice(startsAt, endsAt - 1);
};
