import React, { useEffect, useState, useMemo } from "react";

import classNames from "classnames";
import { isNil } from "lodash";

import { ui } from "lib";
import { ShowHide, Icon } from "components";

export interface ImageProps extends StandardComponentProps {
  readonly src: string | null | undefined;
  readonly alt?: string;
  readonly circle?: boolean;
  readonly tint?: boolean;
  readonly wrapperStyle?: React.CSSProperties;
  readonly wrapperClassName?: string;
  readonly fallbackSrc?: string;
  readonly fallbackComponent?: JSX.Element;
  readonly fallbackIcon?: IconOrElement;
  readonly onLoad?: () => void;
  readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  readonly onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  readonly overlay?: () => JSX.Element;
}

const Image = (props: ImageProps): JSX.Element => {
  const [error, setError] = useState<React.SyntheticEvent<HTMLImageElement> | null>(null);

  useEffect(() => {
    if (!isNil(error)) {
      props.onError?.(error);
    }
  }, [error, props.src]);

  const useFallback = useMemo(() => isNil(props.src) || !isNil(error), [error, props.src]);

  /*
  Note: Because of weird things with AWS and S3, we will sometimes accidentally
	get a blank image URL for an image that is saved in the backend.  TS will not
	pick this up because we always expect the SavedImage `url` property to be
	defined.  In the case that this happens, the onError trigger for the <img>
	will not be triggered as it does not get triggered for null, undefined or
	"" sources.  If this happens, we will first

  (1) Use the fallbackComponent if provided
  (2) Use the fallbackSrc if provided
  (3) As a last resort, render a blank white image.
  */
  if (!isNil(props.fallbackComponent) && useFallback) {
    return props.fallbackComponent;
  }
  return (
    <div
      className={classNames(
        "img-wrapper",
        { circle: props.circle, "with-icon-fallback": !isNil(props.fallbackIcon) && useFallback },
        props.wrapperClassName
      )}
      style={props.wrapperStyle}
      onClick={props.onClick}
    >
      {!isNil(props.overlay) && props.overlay()}
      <ShowHide show={props.tint}>
        <div className={"image-tint"}></div>
      </ShowHide>
      {!isNil(props.fallbackIcon) && useFallback ? (
        <div className={"icon-wrapper"}>
          {ui.iconIsJSX(props.fallbackIcon) ? (
            props.fallbackIcon
          ) : (
            <Icon className={"icon--image-fallback"} icon={props.fallbackIcon} />
          )}
        </div>
      ) : (
        <img
          className={classNames("img", props.className)}
          alt={""}
          /* Just in case the SRC bypasses TS compilation and is undefined, we
					 will just show a blank image. Note that if the SRC is indeed null,
					 undefined or "" - it will not trigger the onError callback. */
          src={props.src || props.fallbackSrc || "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="}
          style={props.style}
          onLoad={() => {
            setError(null);
            props.onLoad?.();
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => setError(e)}
        />
      )}
    </div>
  );
};

export default React.memo(Image);
