import { ReactNode } from "react";
import { useHistory } from "react-router-dom";
import { map, isNil } from "lodash";
import classNames from "classnames";

import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-regular-svg-icons";

import "./AncestorsBreadCrumbs.scss";

interface AncestorBreadCrumbItemProps {
  children: ReactNode;
  url: string;
  last: boolean;
  icon?: ReactNode;
}

const AncestorBreadCrumbItem = ({ url, children, icon, last }: AncestorBreadCrumbItemProps): JSX.Element => {
  const history = useHistory();

  return (
    <div className={classNames("ancestors-bread-crumb-item", { last })} onClick={() => history.push(url)}>
      {!isNil(icon) && <div className={"icon-wrapper"}>{icon}</div>}
      <div className={"content-wrapper"}>
        {children}
        {last === false && <span className={"slash"}>{"/"}</span>}
      </div>
    </div>
  );
};

interface AncestorsBreadCrumbsProps {
  ancestors: IAncestor[];
  budgetId: number;
  loading: boolean;
}

const PrimaryAncestorIcon = ({ loading }: { loading: boolean }): JSX.Element => {
  const loadingIcon = <LoadingOutlined spin />;
  if (loading === false) {
    return <FontAwesomeIcon icon={faFileExcel} />;
  }
  return <Spin className={"ancestor-spinner"} indicator={loadingIcon} size={"small"} />;
};

const AncestorsBreadCrumbs = ({ ancestors, budgetId, loading }: AncestorsBreadCrumbsProps): JSX.Element => {
  return (
    <div className={"ancestors-bread-crumbs"}>
      {map(ancestors, (ancestor: IAncestor, index: number) => {
        return (
          /* eslint-disable indent */
          <AncestorBreadCrumbItem
            key={index}
            url={
              ancestor.type === "subaccount"
                ? `/budgets/${budgetId}/subaccounts/${ancestor.id}`
                : ancestor.type === "account"
                ? `/budgets/${budgetId}/accounts/${ancestor.id}`
                : `/budgets/${budgetId}/accounts`
            }
            last={index === ancestors.length - 1}
            icon={ancestor.type === "budget" ? <PrimaryAncestorIcon loading={loading} /> : undefined}
          >
            {ancestor.name}
          </AncestorBreadCrumbItem>
        );
      })}
    </div>
  );
};

export default AncestorsBreadCrumbs;
