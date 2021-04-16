export const getTextColor = (tagColor: string): string => {
  const r = parseInt(tagColor.substring(1, 3), 16) * 0.299;
  const g = parseInt(tagColor.substring(3, 5), 16) * 0.587;
  const b = parseInt(tagColor.substring(5, 7), 16) * 0.114;
  return r + g + b < 200 ? "white" : "#3f4252";
};
