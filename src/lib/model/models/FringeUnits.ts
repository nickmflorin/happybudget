/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
export enum FringeUnitNames {
  PERCENT = "Percent",
  FLAT = "Flat"
}

export const FringeUnitModels: { [key: string]: Model.FringeUnit } = {
  PERCENT: { id: 0, name: FringeUnitNames.PERCENT },
  FLAT: { id: 1, name: FringeUnitNames.FLAT }
};

const FringeUnits = Object.values(FringeUnitModels);
export default FringeUnits;
