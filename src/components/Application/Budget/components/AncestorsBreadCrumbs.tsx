import { ReactNode } from "react";
import { useHistory } from "react-router-dom";
import { map, filter, isNil } from "lodash";
import classNames from "classnames";

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
  budget: IBudget;
}

const AncestorsBreadCrumbs = ({ ancestors, budget }: AncestorsBreadCrumbsProps): JSX.Element => {
  return (
    <div className={"ancestors-bread-crumbs"}>
      <AncestorBreadCrumbItem
        url={`/budgets/${budget.id}/accounts`}
        icon={<FontAwesomeIcon icon={faFileExcel} />}
        last={false}
      >
        {budget.name}
      </AncestorBreadCrumbItem>
      {map(ancestors, (ancestor: IAncestor, index: number) => {
        if (ancestor.type !== "budget") {
          return (
            <AncestorBreadCrumbItem
              url={
                ancestor.type === "subaccount"
                  ? `/budgets/${budget.id}/subaccounts/${ancestor.id}`
                  : `/budgets/${budget.id}/accounts/${ancestor.id}`
              }
              last={index === filter(ancestors, (a: IAncestor) => a.type !== "budget").length}
            >
              {ancestor.name}
            </AncestorBreadCrumbItem>
          );
        }
      })}
    </div>
  );
};

export default AncestorsBreadCrumbs;
