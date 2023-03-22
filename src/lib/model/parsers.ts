export const parseIdsFromDeliminatedString = (value: string, delimiter = ","): number[] => {
  const split: string[] = value.split(delimiter);
  return split.reduce((curr: number[], id: string) => {
    const trimmed = id.trim();
    if (!isNaN(parseInt(trimmed))) {
      return [...curr, parseInt(trimmed)];
    }
    return curr;
  }, []);
};

/**
 * Safely parses a name into the first and last name, even in the case that there are multiple name
 * parts.
 *
 * For instance, if we have "Steven van Winkle" it will parse as
 * >>> ["Steven", "van Winkle"]
 *
 * @param {string} name The name that should be parsed into first/last name components.
 */
export const parseFirstAndLastName = (name: string): [string | null, string | null] => {
  const parts = name.trim().split(" ");
  const names: [string, (string | null)[]] = ["", []];
  parts.forEach((part: string) => {
    if (part !== "") {
      if (names[0] === "") {
        names[0] = part;
      } else {
        names[1].push(part);
      }
    }
  });
  if (names[1].length === 0) {
    return names[0].trim() === "" ? [null, null] : [names[0], null];
  }
  return [names[0].trim(), names[1].join(" ")];
};
