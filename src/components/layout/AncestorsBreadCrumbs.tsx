import React, { useCallback } from "react";
import { useHistory } from "react-router-dom";
import { map, isNil, find } from "lodash";
import classNames from "classnames";

import { Select } from "antd";

import "./AncestorsBreadCrumbs.scss";

interface AncestorBreadCrumbItemProps {
  ancestor: IAncestor;
  budgetId: number;
  last: boolean;
}

const AncestorBreadCrumbItem = ({ budgetId, ancestor, last }: AncestorBreadCrumbItemProps): JSX.Element => {
  const history = useHistory();

  /* eslint-disable indent */
  const getUrl = useCallback(
    (entity: IAncestor | IBudgetItem): string => {
      return entity.type === "subaccount"
        ? `/budgets/${budgetId}/subaccounts/${entity.id}`
        : entity.type === "account"
        ? `/budgets/${budgetId}/accounts/${entity.id}`
        : `/budgets/${budgetId}/accounts`;
    },
    [budgetId]
  );

  if (!isNil(ancestor.siblings)) {
    return (
      <div className={classNames("ancestors-bread-crumb-item", { last })}>
        <div className={"select-wrapper"}>
          <Select
            className={"select--ancestor"}
            value={ancestor.id}
            bordered={false}
            onChange={(value: number) => {
              const sibling = find(ancestor.siblings, { id: value });
              if (isNil(sibling)) {
                /* eslint-disable no-console */
                console.error(`The select value corresponds to a sibling ${value} that is not in state!`);
              } else if (sibling.id !== ancestor.id) {
                console.log(getUrl(sibling));
                history.push(getUrl(sibling));
              }
            }}
          >
            {map(ancestor.siblings, (sibling: IBudgetItem) => {
              return (
                <Select.Option value={sibling.id}>
                  <div className={"select-ancestor-option"}>
                    <span className={"identifier"}>{sibling.identifier}</span>
                    <span className={"description"}>{sibling.description}</span>
                  </div>
                </Select.Option>
              );
            })}
          </Select>
        </div>
      </div>
    );
  }
  return (
    <div
      className={classNames("ancestors-bread-crumb-item", {
        last,
        "budget-ancestor-bread-crumb-item": ancestor.type === "budget"
      })}
      onClick={() => history.push(getUrl(ancestor))}
    >
      <div className={"text-wrapper"}>{ancestor.identifier}</div>
    </div>
  );
};

interface AncestorsBreadCrumbsProps {
  ancestors: IAncestor[];
  budgetId: number;
}

const AncestorsBreadCrumbs = ({ ancestors, budgetId }: AncestorsBreadCrumbsProps): JSX.Element => {
  return (
    <div className={"ancestors-bread-crumbs"}>
      {map(ancestors, (ancestor: IAncestor, index: number) => {
        return (
          <React.Fragment>
            <AncestorBreadCrumbItem
              key={index}
              ancestor={ancestor}
              budgetId={budgetId}
              last={index === ancestors.length - 1}
            />
            {index !== ancestors.length - 1 && <span className={"slash"}>{"/"}</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default AncestorsBreadCrumbs;
