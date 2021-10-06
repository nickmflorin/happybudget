export const toTitleCase = (value: string): string => {
  return value.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const formatAsCurrency: Table.NativeFormatter<number | string> = (value: string | number | null): string => {
  if (value === null || String(value).trim() === "") {
    return "";
  }
  const numericValue = parseFloat(String(value));
  if (isNaN(numericValue)) {
    /* eslint-disable no-console */
    console.error(`Could not parse value ${value} into currency!`);
    return "";
  }
  return numericValue.toFixed(2);
};

export const formatPercentage: Table.NativeFormatter<number | string> = (value: number | string | null): string => {
  if (value === null || String(value).trim() === "") {
    value = 0.0;
  }
  const numericValue = parseFloat(String(value));
  if (isNaN(numericValue)) {
    /* eslint-disable no-console */
    console.error(`Could not parse value ${value} into percentage!`);
    return "";
  }
  return Number(value).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 });
};

export const formatAsPhoneNumber: Table.NativeFormatter<number | string> = (value: number | string | null): string => {
  if (value === null || String(value).trim() === "") {
    return "";
  }
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
