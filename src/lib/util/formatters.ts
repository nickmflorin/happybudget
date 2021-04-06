import { forEach } from "lodash";

/**
 * Safely parses a name into the first and last name, even in the case that
 * there are multiple name parts.
 *
 * For instance, if we have "Steven van Winkle" it will parse as
 * >>> ["Steven", "van Winkle"]
 *
 * @param name The name that should be parsed into first/last name components.
 */
export const parseNames = (name: string, strict: boolean = false): string[] => {
  const parts = name.trim().split(" ");
  const names: any[] = ["", []];
  forEach(parts, (part: string) => {
    if (part !== "") {
      if (names[0] === "") {
        names[0] = part;
      } else {
        names[1].push(part);
      }
    }
  });
  if (strict === true && (names[0] === "" || names[1].length === 0)) {
    throw new Error(`Could not parse first/last names from ${name}.`);
  }
  return [names[0], names[1].join(" ")];
};

export const toTitleCase = (value: string): string => {
  return value.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const formatCurrency = (value: string | number): string => {
  var formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });
  if (typeof value === "string") {
    return formatter.format(parseInt(value));
  }
  return formatter.format(value);
};

export const formatCurrencyWithoutDollarSign = (value: string | number): string => {
  return formatCurrency(value).slice(1);
};

export const formatPercentage = (value: number): string => {
  return Number(value).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 });
};
