import React from "react";
import { useHistory } from "react-router-dom";
import { map, isNil, find } from "lodash";
import classNames from "classnames";

import { Dropdown, ShowHide } from "components";
import { EntityTextButton } from "components/buttons";
import { EntityText } from "components/typography";

import { getUrl } from "../urls";
import "./AncestorsBreadCrumbs.scss";

interface AncestorBreadCrumbItemProps extends StandardComponentProps {
  children: JSX.Element;
  url?: string;
}

const AncestorBreadCrumbItem = ({ className, style = {}, children, url }: AncestorBreadCrumbItemProps): JSX.Element => {
  const history = useHistory();

  return (
    <div
      className={classNames("ancestors-bread-crumb-item", className)}
      style={style}
      onClick={() => (!isNil(url) ? history.push(url) : undefined)}
    >
      {children}
    </div>
  );
};

interface AncestorBreadCrumbSelectItemProps extends StandardComponentProps {
  instance: Model.Account | Model.SubAccount;
  budget: Model.Budget | Model.Template;
}

const AncestorBreadCrumbSelectItem = ({
  instance,
  className,
  budget,
  style = {}
}: AncestorBreadCrumbSelectItemProps): JSX.Element => {
  const history = useHistory();

  return (
    <AncestorBreadCrumbItem className={className} style={style}>
      <Dropdown
        trigger={["click"]}
        items={map(instance.siblings, (sibling: any) => {
          return (
            <Dropdown.Menu.Item id={sibling.id} onClick={() => history.push(getUrl(budget, sibling))}>
              <EntityText fillEmpty={"---------"}>{sibling}</EntityText>
            </Dropdown.Menu.Item>
          );
        })}
      >
        <EntityTextButton fillEmpty={"---------"}>{instance}</EntityTextButton>
      </Dropdown>
    </AncestorBreadCrumbItem>
  );
};

interface AncestorBreadCrumbEntityItemProps extends StandardComponentProps {
  budget: Model.Budget | Model.Template;
  children: Model.SimpleSubAccount | Model.SimpleAccount;
}

const AncestorBreadCrumbEntityItem = ({ children, budget }: AncestorBreadCrumbEntityItemProps): JSX.Element => {
  return (
    <AncestorBreadCrumbItem url={getUrl(budget, children)}>
      <div className={"entity-text-wrapper"}>
        <EntityText>{children}</EntityText>
      </div>
    </AncestorBreadCrumbItem>
  );
};

interface AncestorBreadCrumbBudgetItemProps {
  budget: Model.Budget | Model.Template;
}

const AncestorBreadCrumbBudgetItem = ({ budget }: AncestorBreadCrumbBudgetItemProps): JSX.Element => {
  return (
    <AncestorBreadCrumbItem url={getUrl(budget)}>
      <div className={"budget-text-wrapper"}>{budget.name}</div>
    </AncestorBreadCrumbItem>
  );
};

interface AncestorsBreadCrumbsProps {
  instance: Model.Account | Model.SubAccount | null;
  budget: Model.Budget | Model.Template;
}

const AncestorsBreadCrumbs = ({ instance, budget }: AncestorsBreadCrumbsProps): JSX.Element => {
  console.log({ instance, ancestors: !isNil(instance) ? instance.ancestors : null });
  return (
    <div className={"ancestors-bread-crumbs"}>
      <AncestorBreadCrumbBudgetItem budget={budget} />
      {!isNil(instance) && (
        <React.Fragment>
          <span className={"slash"}>{"/"}</span>
          {map(instance.ancestors.slice(1), (entity: Model.SimpleSubAccount | Model.SimpleAccount, index: number) => {
            return (
              <React.Fragment key={index}>
                <AncestorBreadCrumbEntityItem budget={budget}>{entity}</AncestorBreadCrumbEntityItem>
                {index !== instance.ancestors.length - 1 && <span className={"slash"}>{"/"}</span>}
              </React.Fragment>
            );
          })}
          <ShowHide show={instance.siblings.length !== 0}>
            <AncestorBreadCrumbSelectItem instance={instance} budget={budget} />
          </ShowHide>
          <ShowHide show={instance.siblings.length === 0}>
            <AncestorBreadCrumbEntityItem budget={budget}>{instance}</AncestorBreadCrumbEntityItem>
          </ShowHide>
        </React.Fragment>
      )}
    </div>
  );
};

export default AncestorsBreadCrumbs;
