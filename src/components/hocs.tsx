import React, { forwardRef, ForwardedRef } from "react";
import classNames from "classnames";

import { ui } from "lib";
import { isNil } from "lodash";

import { UseSizeConfig } from "lib/ui/hooks";

type WithSizeConfig<
  T extends string = StandardSize,
  P extends UseSizeProps<T, string> = UseSizeProps<T, "size">
> = Omit<UseSizeConfig<T, P>, "options"> & {
  readonly classNamePrefix?: string;
  readonly hasRef?: boolean;
  readonly options?: T[];
};

export const withSize =
  <
    PROPS extends { readonly className?: string; readonly ref?: ForwardedRef<REF> },
    T extends string = StandardSize,
    SP extends string = "size",
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    REF = any,
    P extends UseSizeProps<T, string> = UseSizeProps<T, SP>,
    CT extends PROPS & P = PROPS & P
  >(
    conf?: WithSizeConfig<T, P>
  ) =>
  (
    Component: React.FunctionComponent<PROPS>
  ): typeof conf extends { readonly hasRef: true }
    ? React.ForwardRefRenderFunction<REF, CT & { readonly ref?: ForwardedRef<REF> }>
    : React.FunctionComponent<CT> => {
    const WithSize = (props: CT & { readonly forwardedRef?: ForwardedRef<REF> }): JSX.Element => {
      const _size = ui.hooks.useSize(props, conf);

      let injectedProps = { ...props };

      const options = conf?.options || (["xsmall", "small", "medium", "standard", "large", "xlarge"] as T[]);
      delete injectedProps[conf?.sizeProp || "size"];
      for (let i = 0; i < options.length; i++) {
        delete injectedProps[options[i]];
      }
      const sizeClassName: string | undefined = !isNil(_size)
        ? !isNil(conf?.classNamePrefix)
          ? `${conf?.classNamePrefix}${_size}`
          : _size
        : undefined;
      injectedProps = { ...injectedProps, className: classNames(props.className, sizeClassName) };

      const { forwardedRef, ...rest } = injectedProps;
      if (!isNil(forwardedRef)) {
        return <Component ref={forwardedRef} {...(rest as CT)} />;
      }
      return <Component {...(rest as CT)} />;
    };
    if (conf?.hasRef === true) {
      return forwardRef((props: CT, ref: ForwardedRef<REF>) => (
        <WithSize {...props} forwardedRef={ref} />
      )) as React.ForwardRefRenderFunction<REF, CT & { readonly ref?: ForwardedRef<REF> }>;
    }
    return WithSize;
  };
