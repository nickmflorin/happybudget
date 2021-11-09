import { useEffect } from "react";

import { Fancybox as NativeFancybox } from "@fancyapps/ui/dist/fancybox.esm.js";

interface FancyBoxOptions {
  readonly infinite?: boolean;
}

interface FancyboxProps {
  readonly children: JSX.Element;
  readonly options?: FancyBoxOptions;
}

function Fancybox(props: FancyboxProps) {
  useEffect(() => {
    const opts = props.options || {};

    NativeFancybox.bind("[data-fancybox]", opts);

    return () => {
      NativeFancybox.destroy();
    };
  }, [props.options]);

  return <>{props.children}</>;
}

export default Fancybox;
