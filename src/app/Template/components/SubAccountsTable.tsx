import React, { useState } from "react";
import { useSelector } from "react-redux";
import { filter } from "lodash";

import { tabling } from "lib";

import { SubAccountsTable as GenericSubAccountsTable } from "tabling";
import { selectors } from "../store";
import FringesModal from "./FringesModal";

type OmitTableProps = "menuPortalId" | "columns" | "fringes" | "subAccountUnits" | "onEditFringes" | "onAddFringes";

export interface TemplateSubAccountsTableProps
  extends Omit<GenericSubAccountsTable.AuthenticatedTemplateProps, OmitTableProps> {
  readonly id: number;
  readonly budgetId: number;
  readonly parentType: "account" | "subaccount";
  readonly budget: Model.Template | null;
}

const SubAccountsTable = ({
  id,
  budget,
  budgetId,
  parentType,
  ...props
}: TemplateSubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const fringesTable = tabling.hooks.useTable<Tables.FringeRowData, Model.Fringe>();
  const fringes = useSelector((s: Application.Store) => selectors.selectFringes(s, parentType));
  const subaccountUnits = useSelector((s: Application.Store) => selectors.selectSubAccountUnits(s, parentType));

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
        parentType={parentType}
        budgetId={budgetId}
        open={fringesModalVisible}
        onCancel={() => setFringesModalVisible(false)}
      />
    </React.Fragment>
  );
};

export default SubAccountsTable;
