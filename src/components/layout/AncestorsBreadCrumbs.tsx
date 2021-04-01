import { useMemo } from "react";
import { useHistory } from "react-router-dom";
import { map, isNil } from "lodash";
import classNames from "classnames";

import { Spin, Select } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./AncestorsBreadCrumbs.scss";

interface AncestorBreadCrumbItemProps {
  ancestor: IAncestor;
  budgetId: number;
  last: boolean;
}

const AncestorBreadCrumbItem = ({ budgetId, ancestor, last }: AncestorBreadCrumbItemProps): JSX.Element => {
  /* eslint-disable indent */
  const URL = useMemo(() => {
    return ancestor.type === "subaccount"
      ? `/budgets/${budgetId}/subaccounts/${ancestor.id}`
      : ancestor.type === "account"
      ? `/budgets/${budgetId}/accounts/${ancestor.id}`
      : `/budgets/${budgetId}/accounts`;
  }, [ancestor, budgetId]);

  const history = useHistory();
  if (!isNil(ancestor.siblings)) {
    return (
      <div className={classNames("ancestors-bread-crumb-item", { last })}>
        <div className={"select-wrapper"}>
          <Select className={"select--ancestor"} value={ancestor.id} bordered={false}>
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
        {last === false && <span className={"slash"}>{"/"}</span>}
      </div>
    );
  }
  return (
    <div className={classNames("ancestors-bread-crumb-item", { last })} onClick={() => history.push(URL)}>
      <div className={"content-wrapper"}>
        {ancestor.identifier}
        {last === false && <span className={"slash"}>{"/"}</span>}
      </div>
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
          /* eslint-disable indent */
          <AncestorBreadCrumbItem
            key={index}
            ancestor={ancestor}
            budgetId={budgetId}
            last={index === ancestors.length - 1}
          />
        );
      })}
    </div>
  );
};

export default AncestorsBreadCrumbs;
