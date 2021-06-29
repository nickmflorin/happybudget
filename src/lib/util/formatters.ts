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
  if (Math.sign(value as number) < 0) {
    const removeAllSymbols = formatCurrency(value).slice(2);
    const negativeValue = `-${removeAllSymbols}`;
    return negativeValue;
    // return removeSymbols;
  }
  return formatCurrency(value).slice(1);
};

export const formatPercentage = (value: number): string => {
  return Number(value).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 });
};

export const formatAsPhoneNumber = (value: number | string): string => {
  let numeric = String(value).replace(/\D/g, "");
  if (numeric.length >= 12) {
    // Don't format string.
    return numeric;
  } else if (numeric.length === 11 || numeric.length === 10) {
    const match = numeric.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      var intlCode = match[1] ? "+1 " : "";
      return [intlCode, "(", match[2], ") ", match[3], " ", match[4]].join("");
    } else {
      return numeric;
    }
  } else {
    if (numeric.length < 3) {
      return numeric;
    } else {
      const firstPart = "(" + numeric.slice(0, 3) + ")";
      if (numeric.length === 3) {
        return firstPart;
      } else {
        const secondPart = numeric.slice(3, 6);
        if (numeric.length <= 6) {
          return firstPart + " " + secondPart;
        } else {
          const thirdPart = numeric.slice(6, 10);
          return firstPart + " " + secondPart + " " + thirdPart;
        }
      }
    }
  }
};
