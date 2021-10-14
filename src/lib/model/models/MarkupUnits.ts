/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export enum MarkupUnitNames {
  PERCENT = "Percent",
  FLAT = "Flat"
}

export const MarkupUnitModels: { [key: string]: Model.MarkupUnit } = {
  PERCENT: { id: 0, name: MarkupUnitNames.PERCENT },
  FLAT: { id: 1, name: MarkupUnitNames.FLAT }
};

const MarkupUnits = Object.values(MarkupUnitModels);
export default MarkupUnits;
