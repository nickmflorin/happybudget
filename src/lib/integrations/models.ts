export enum ActualImportSourceNames {
    PLAID = "plaid"
}

export const ActualImportSourceModels: { [key: string]: Model.ActualImportSource } = {
  PLAID: { id: 0, name: ActualImportSourceNames.PLAID }
};
  
export const ActualImportSources = Object.values(ActualImportSourceModels);
