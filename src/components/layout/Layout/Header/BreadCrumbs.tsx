import React, { ReactNode, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { map, isNil, orderBy, forEach } from "lodash";
import classNames from "classnames";

import { Dropdown, TooltipWrapper } from "components";
import { Button } from "components/buttons";
import { hooks } from "lib";

import "./BreadCrumbs.scss";

const isLazyBreadCrumbItem = (item: IBreadCrumbItem | ILazyBreadCrumbItem): item is ILazyBreadCrumbItem => {
  return (item as ILazyBreadCrumbItem).func !== undefined;
};

interface BreadCrumbGenericItemProps extends StandardComponentProps {
  readonly url?: string;
  readonly children: ReactNode;
  readonly tooltip?: Tooltip;
  readonly primary?: boolean;
  readonly suppressClickBehavior?: boolean;
  readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const BreadCrumbGenericItem = ({
  className,
  style = {},
  tooltip,
  primary,
  children,
  onClick,
  suppressClickBehavior,
  url
}: BreadCrumbGenericItemProps): JSX.Element => {
  const history = useHistory();
  return (
    <div
      className={classNames("bread-crumb-item", className, { primary })}
      style={style}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (!suppressClickBehavior) {
          if (!isNil(onClick)) {
            onClick(e);
          } else if (!isNil(url)) {
            history.push(url);
          }
        }
      }}
    >
      <TooltipWrapper tooltip={tooltip}>{children}</TooltipWrapper>
    </div>
  );
};

const MemoizedBreadCrumbGenericItem = React.memo(BreadCrumbGenericItem);

interface BreadCrumbItemProps extends StandardComponentProps {
  readonly item: IBreadCrumbItem;
  readonly primary?: boolean;
}

const BreadCrumbItem = ({ item, ...props }: BreadCrumbItemProps): JSX.Element => {
  const renderItem = (i: IBreadCrumbItem) => {
    if (!isNil(i.label)) {
      return i.label;
    } else if (!isNil(i.render)) {
      return i.render();
    }
    return <></>;
  };

  const renderDropdownButton = (i: IBreadCrumbItem): React.ReactChild => {
    if (!isNil(i.label)) {
      return <Button>{i.label}</Button>;
    } else if (!isNil(i.render)) {
      return i.render();
    }
    return <></>;
  };

  return (
    <MemoizedBreadCrumbGenericItem
      {...props}
      tooltip={item.tooltip}
      url={item.url}
      primary={item.primary}
      suppressClickBehavior={!isNil(item.options) && item.options.length !== 0}
    >
      {!isNil(item.options) && item.options.length !== 0 ? (
        <Dropdown
          trigger={["click"]}
          overlayClassName={"bread-crumb-dropdown"}
          menuDefaultSelected={[item.id]}
          menuItems={orderBy(item.options, (obj: MenuItemModel) => obj.id)}
        >
          {renderDropdownButton(item)}
        </Dropdown>
      ) : (
        <div className={"text-wrapper"}>{renderItem(item)}</div>
      )}
    </MemoizedBreadCrumbGenericItem>
  );
};

const MemoizedBreadCrumbItem = React.memo(BreadCrumbItem);

interface BreadCrumbItemsProps {
  readonly children: JSX.Element[];
}

const BreadCrumbItems = ({ children }: BreadCrumbItemsProps): JSX.Element => {
  if (children.length === 0) {
    return <></>;
  } else {
    return (
      <React.Fragment>
        {map(children, (child: JSX.Element, index: number) => {
          if (index === children.length - 1) {
            return <React.Fragment key={index}>{child}</React.Fragment>;
          } else {
            return (
              <React.Fragment key={index}>
                {child}
                <span className={"slash"}>{"/"}</span>
              </React.Fragment>
            );
          }
        })}
      </React.Fragment>
    );
  }
};

const MemoizedBreadCrumbItems = React.memo(BreadCrumbItems);

interface BreadCrumbsProps extends StandardComponentProps {
  readonly items?: (IBreadCrumbItem | ILazyBreadCrumbItem)[];
  readonly itemProps?: StandardComponentProps;
  readonly params?: { [key: string]: any };
  readonly children?: JSX.Element[];
}

const BreadCrumbs = ({ items, itemProps, params, children, ...props }: BreadCrumbsProps): JSX.Element => {
  const parametersPresent = hooks.useDynamicCallback((item: ILazyBreadCrumbItem): [boolean, { [key: string]: any }] => {
    if ((item.requiredParams.length !== 0 && !isNil(params) && Object.keys(params).length === 0) || isNil(params)) {
      return [false, {}];
    }
    let allRequiredParamsPresent = true;
    let presentParamsObj: { [key: string]: any } = {};
    forEach(item.requiredParams, (param: string) => {
      if (isNil(params[param])) {
        allRequiredParamsPresent = false;
        return false;
      } else {
        presentParamsObj[param] = params[param];
      }
    });
    return [allRequiredParamsPresent, presentParamsObj];
  });

  const preparedItems = useMemo((): IBreadCrumbItem[] | null => {
    if (isNil(items)) {
      return null;
    }
    let transformed: IBreadCrumbItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item: IBreadCrumbItem | ILazyBreadCrumbItem = items[i];
      if (isLazyBreadCrumbItem(item)) {
        const [allRequiredParamsPresent, presentParamsObj] = parametersPresent(item);
        if (allRequiredParamsPresent === true) {
          const newItems = item.func(presentParamsObj);
          if (Array.isArray(newItems)) {
            transformed = [...transformed, ...newItems];
          } else {
            transformed = [...transformed, newItems];
          }
        }
      } else {
        if (item.visible !== false) {
          transformed.push(item);
        }
      }
    }
    return transformed;
  }, [items, params]);

  if (!isNil(children)) {
    return (
      <div {...props} className={classNames("bread-crumbs", props.className)}>
        <MemoizedBreadCrumbItems>{children}</MemoizedBreadCrumbItems>
      </div>
    );
  } else if (!isNil(preparedItems)) {
    return (
      <div {...props} className={classNames("bread-crumbs", props.className)}>
        <MemoizedBreadCrumbItems>
          {map(preparedItems, (item: IBreadCrumbItem, index: number) => (
            <MemoizedBreadCrumbItem {...itemProps} key={index} item={item} />
          ))}
        </MemoizedBreadCrumbItems>
      </div>
    );
  } else {
    return <></>;
  }
};

export default React.memo(BreadCrumbs);
