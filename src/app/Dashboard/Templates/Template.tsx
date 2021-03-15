import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

import { CreateBudgetModal } from "components/modals";

import { ActionDomains, addBudgetToStateAction } from "../actions";
import { TemplateConfig } from "./constants";

interface TemplateProps {
  config: TemplateConfig;
}

const Template = ({ config }: TemplateProps): JSX.Element => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const dispatch: Dispatch = useDispatch();

  return (
    <React.Fragment>
      <div className={"template"} onClick={() => setCreateModalOpen(true)}>
        <div className={"template-icon"} style={{ backgroundColor: config.color }}>
          {config.icon}
        </div>
        <div className={"template-text"}>{config.text}</div>
      </div>
      <CreateBudgetModal
        productionType={config.productionType}
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={(budget: IBudget) => {
          setCreateModalOpen(false);
          dispatch(addBudgetToStateAction(ActionDomains.ACTIVE, budget));
        }}
      />
    </React.Fragment>
  );
};

export default Template;
