import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import { budgeting } from "lib";
import { Portal, BreadCrumbs } from "components/layout";

import { actions } from "../../store";
import AccountsTable from "./AccountsTable";

interface AccountsProps {
  readonly templateId: number;
  readonly template: Model.Template | undefined;
}

const Accounts = ({ templateId, template }: AccountsProps): JSX.Element => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.setTemplateAutoIndex(false));
  }, []);

  useEffect(() => {
    if (!isNil(templateId)) {
      budgeting.urls.setTemplateLastVisited(templateId, `/templates/${templateId}/accounts`);
    }
  }, [templateId]);

  return (
    <React.Fragment>
      <Portal id={"breadcrumbs"}>
        <BreadCrumbs
          params={{ t: template }}
          items={[
            {
              requiredParams: ["t"],
              func: ({ t }: { t: Model.Template }) => ({
                id: t.id,
                primary: true,
                label: t.name,
                tooltip: { title: "Top Sheet", placement: "bottom" },
                url: budgeting.urls.getUrl(t)
              })
            }
          ]}
        />
      </Portal>
      <AccountsTable template={template} templateId={templateId} />
    </React.Fragment>
  );
};

export default Accounts;
