import React, { useState } from "react";
import { useSelector } from "react-redux";
import { filter } from "lodash";

import { tabling } from "lib";

import { SubAccountsTable as GenericSubAccountsTable } from "components/tabling";
import { selectFringes, selectSubAccountUnits } from "../store/selectors";
import FringesModal from "./FringesModal";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

type OmitTableProps = "menuPortalId" | "columns" | "fringes" | "subAccountUnits" | "onEditFringes" | "onAddFringes";

export interface TemplateSubAccountsTableProps
  extends Omit<GenericSubAccountsTable.AuthenticatedTemplateProps, OmitTableProps> {
  readonly templateId: number;
  readonly template: Model.Template | null;
}

const SubAccountsTable = ({ template, templateId, ...props }: TemplateSubAccountsTableProps): JSX.Element => {
  const [fringesModalVisible, setFringesModalVisible] = useState(false);
  const table = tabling.hooks.useTableIfNotDefined<R, M>(props.table);
  const fringes = useSelector(selectFringes);
  const subaccountUnits = useSelector(selectSubAccountUnits);

  return (
    <React.Fragment>
      <GenericSubAccountsTable.AuthenticatedTemplate
        {...props}
        table={table}
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
      <FringesModal budget={template} open={fringesModalVisible} onCancel={() => setFringesModalVisible(false)} />
    </React.Fragment>
  );
};

export default SubAccountsTable;
