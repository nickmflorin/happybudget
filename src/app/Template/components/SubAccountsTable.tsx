import React, { useState } from "react";
import { useSelector } from "react-redux";
import { filter } from "lodash";

import { tabling } from "lib";

import { SubAccountsTable as GenericSubAccountsTable } from "tabling";
import { selectFringes, selectSubAccountUnits } from "../store/selectors";
import FringesModal from "./FringesModal";

type OmitTableProps = "menuPortalId" | "columns" | "fringes" | "subAccountUnits" | "onEditFringes" | "onAddFringes";

export interface TemplateSubAccountsTableProps
  extends Omit<GenericSubAccountsTable.AuthenticatedTemplateProps, OmitTableProps> {
  readonly id: number;
  readonly budgetId: number;
  readonly budget: Model.Template | null;
}

const SubAccountsTable = ({ id, budget, budgetId, ...props }: TemplateSubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const fringes = useSelector(selectFringes);
  const subaccountUnits = useSelector(selectSubAccountUnits);
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();

  return (
    <React.Fragment>
      <GenericSubAccountsTable.AuthenticatedTemplate
        {...props}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        subAccountUnits={subaccountUnits}
        onAddFringes={() => setFringesModalVisible(true)}
        onEditFringes={() => setFringesModalVisible(true)}
        fringes={
          filter(fringes, (f: Table.BodyRow<Tables.FringeRowData>) =>
            tabling.typeguards.isModelRow(f)
          ) as Tables.FringeRow[]
        }
      />
      <FringesModal
        id={id}
        budget={budget}
        table={fringesTable}
        budgetId={budgetId}
        open={fringesModalVisible}
        onCancel={() => setFringesModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default SubAccountsTable;
