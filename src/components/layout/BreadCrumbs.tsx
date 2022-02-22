import React, { ReactNode, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { map, isNil, reduce } from "lodash";
import classNames from "classnames";

import { Button } from "components/buttons";
import { DropdownMenu } from "components/dropdowns";
import { TooltipWrapper } from "components/tooltips";

const isLazyBreadCrumbItem = <P extends Record<string, unknown> = Record<string, unknown>>(
  item: IBreadCrumbItem | ILazyBreadCrumbItem<P>
): item is ILazyBreadCrumbItem<P> => {
  return (item as ILazyBreadCrumbItem<P>).func !== undefined;
};

type BreadCrumbGenericItemProps = StandardComponentProps & {
  readonly url?: string;
  readonly children: ReactNode;
  readonly tooltip?: Tooltip;
  readonly primary?: boolean;
  readonly suppressClickBehavior?: boolean;
  readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

const BreadCrumbGenericItem = React.memo(
  ({ tooltip, primary, suppressClickBehavior, url, ...props }: BreadCrumbGenericItemProps): JSX.Element => {
    const history = useHistory();
    return (
      <div
        {...props}
        className={classNames("bread-crumb-item", props.className, { primary })}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!suppressClickBehavior) {
            if (!isNil(props.onClick)) {
              props.onClick(e);
            } else if (!isNil(url)) {
              history.push(url);
            }
          }
        }}
      >
        <TooltipWrapper tooltip={tooltip}>{props.children}</TooltipWrapper>
      </div>
    );
  }
);

interface BreadCrumbItemProps extends StandardComponentProps {
  readonly item: IBreadCrumbItem;
  readonly primary?: boolean;
}

const BreadCrumbItem = React.memo(({ item, ...props }: BreadCrumbItemProps): JSX.Element => {
  const renderItem = useMemo(
    () => (i: IBreadCrumbItem) => {
      if (!isNil(i.label)) {
        return i.label;
      } else if (!isNil(i.renderContent)) {
        return i.renderContent();
      }
      return <></>;
    },
    []
  );

  const renderDropdownButton = useMemo(
    () =>
      (i: IBreadCrumbItem): React.ReactChild => {
        if (!isNil(i.label)) {
          return <Button>{i.label}</Button>;
        } else if (!isNil(i.renderContent)) {
          return i.renderContent();
        }
        return <></>;
      },
    []
  );

  return (
    <BreadCrumbGenericItem
      {...props}
      tooltip={item.tooltip}
      url={item.url}
      primary={item.primary}
      suppressClickBehavior={!isNil(item.options) && item.options.length !== 0}
    >
      {!isNil(item.options) && item.options.length !== 0 ? (
        <DropdownMenu menuClassName={"bread-crumb-dropdown"} defaultSelected={[item.id]} models={item.options}>
          {renderDropdownButton(item)}
        </DropdownMenu>
      ) : (
        <div className={"text-wrapper"}>{renderItem(item)}</div>
      )}
    </BreadCrumbGenericItem>
  );
});

interface BreadCrumbItemsProps {
  readonly children: JSX.Element[];
}

const BreadCrumbItems = React.memo(({ children }: BreadCrumbItemsProps): JSX.Element => {
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
});

interface BreadCrumbsProps<P extends Record<string, unknown> = Record<string, unknown>> extends StandardComponentProps {
  readonly items?: (IBreadCrumbItem | ILazyBreadCrumbItem<P>)[];
  readonly itemProps?: StandardComponentProps;
  readonly params?: { [key in keyof P]: P[keyof P] | null };
  readonly children?: JSX.Element[];
}

const BreadCrumbs = <P extends Record<string, unknown> = Record<string, unknown>>({
  items,
  itemProps,
  params,
  children,
  ...props
}: BreadCrumbsProps<P>): JSX.Element => {
  const parametersPresent = useMemo(
    () =>
      (item: ILazyBreadCrumbItem<P>): [boolean, P] => {
        if ((item.requiredParams.length !== 0 && !isNil(params) && Object.keys(params).length === 0) || isNil(params)) {
          return [false, {} as P];
        }
        let allRequiredParamsPresent = true;
        const presentParamsObj: P = reduce(
          item.requiredParams,
          (curr: P, param: keyof P) => {
            if (isNil(params[param])) {
              allRequiredParamsPresent = false;
              return curr;
            } else {
              return { ...curr, [param]: params[param] };
            }
          },
          {} as P
        );
        return [allRequiredParamsPresent, presentParamsObj];
      },
    [params]
  );

  const preparedItems = useMemo((): IBreadCrumbItem[] | null => {
    if (isNil(items)) {
      return null;
    }
    let transformed: IBreadCrumbItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item: IBreadCrumbItem | ILazyBreadCrumbItem<P> = items[i];
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
  }, [items, parametersPresent]);

  if (!isNil(children)) {
    return (
      <div {...props} className={classNames("bread-crumbs", props.className)}>
        <BreadCrumbItems>{children}</BreadCrumbItems>
      </div>
    );
  } else if (!isNil(preparedItems)) {
    return (
      <div {...props} className={classNames("bread-crumbs", props.className)}>
        <BreadCrumbItems>
          {map(preparedItems, (item: IBreadCrumbItem, index: number) => (
            <BreadCrumbItem {...itemProps} key={index} item={item} />
          ))}
        </BreadCrumbItems>
      </div>
    );
  } else {
    return <></>;
  }
};

export default React.memo(BreadCrumbs) as typeof BreadCrumbs;
