import NextImage from "next/image";
import React, { useEffect, useState } from "react";

import classNames from "classnames";

import { ui } from "lib";
import { Icon } from "components/icons";
import { ShowHide } from "components/util";

export type ImageProps = ui.ComponentProps<{
  readonly src?: string | null;
  readonly alt?: string;
  readonly circle?: true;
  readonly tint?: true;
  readonly wrapperStyle?: ui.Style;
  readonly wrapperClassName?: string;
  readonly fallbackSrc?: string;
  readonly fallbackComponent?: JSX.Element;
  readonly fallbackIcon?: ui.IconProp;
  readonly onLoad?: () => void;
  readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  readonly onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  readonly overlay?: () => JSX.Element;
}>;

export const Image = ({ onError, ...props }: ImageProps): JSX.Element => {
  const [error, setError] = useState<React.SyntheticEvent<HTMLImageElement> | null>(null);

  useEffect(() => {
    if (error !== null) {
      onError?.(error);
    }
  }, [error, onError]);

  const useFallback = props.src === undefined || props.src === null || error !== null;

  /* Note: Because of weird things with AWS and S3, we will sometimes accidentally get a blank image
     URL for an image that is saved in the backend.  TS will not pick this up because we always
     expect the SavedImage `url` property to be defined.  In the case that this happens, the onError
     trigger for the <img> will not be triggered as it does not get triggered for null, undefined or
	   "" sources.  If this happens, we will first

     (1) Use the fallbackComponent if provided
     (2) Use the fallbackSrc if provided
     (3) As a last resort, render a blank white image. */
  if (props.fallbackComponent !== undefined && useFallback) {
    return props.fallbackComponent;
  }
  return (
    <div
      className={classNames(
        "img-wrapper",
        {
          circle: props.circle,
          "img-wrapper--with-icon-fallback": props.fallbackIcon !== undefined && useFallback,
        },
        props.wrapperClassName,
      )}
      style={props.wrapperStyle}
      onClick={props.onClick}
    >
      {props.overlay !== undefined && props.overlay()}
      <ShowHide show={props.tint === true}>
        <div className="image-tint"></div>
      </ShowHide>
      {props.fallbackIcon !== undefined && useFallback ? (
        <Icon className="icon--image-fallback" icon={props.fallbackIcon} />
      ) : (
        <NextImage
          className={classNames("img", props.className)}
          alt=""
          /* Just in case the SRC bypasses TS compilation and is undefined, we will just show a
             blank image. Note that if the SRC is indeed null, undefined or "" - it will not trigger
             the onError callback. */
          src={
            props.src ||
            props.fallbackSrc ||
            "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="
          }
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
