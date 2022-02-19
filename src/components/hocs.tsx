import React, { forwardRef, ForwardedRef, ReactNode } from "react";
import classNames from "classnames";

import { ui } from "lib";
import { isNil } from "lodash";

type WithSizeConfig<S extends string> = {
  readonly default?: S;
  readonly classNamePrefix?: string;
  readonly hasRef?: boolean;
};

export const withSize =
  <
    T extends { readonly className?: string; readonly children?: ReactNode; readonly ref?: ForwardedRef<REF> },
    S extends string,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    REF = any,
    CT extends T & UseSizeProps<S> = T & UseSizeProps<S>
  >(
    options: S[],
    conf?: WithSizeConfig<S>
  ) =>
  (
    Component: React.FunctionComponent<T>
  ): typeof conf extends { readonly hasRef: true }
    ? React.ForwardRefRenderFunction<REF, CT & { readonly ref?: ForwardedRef<REF> }>
    : React.FunctionComponent<CT> => {
    const WithSize = (props: CT & { readonly forwardedRef?: ForwardedRef<REF> }): JSX.Element => {
      const _size = ui.hooks.useSize({ options, default: conf?.default }, props);

      let injectedProps = { ...props };
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
