import { useMemo } from "react";
import { isNil } from "lodash";

interface ImageProps extends StandardComponentProps {
  readonly src?: string;
  readonly alt?: string;
}

/**
 * A component for rendering an image that is stored either in AWS S3 or the
 * backend file system (in local dev).  In local development, by default, the
 * image URLs will be absolute paths without a domain - because Django assumes
 * you are using a frontend on the same domain.  This will cause image URLs in
 * local dev to try to find the image in the frontend domain.
 *
 * Example:
 * Image URL:  /users/1/profile/profile_image_1_mXeiFJu.jpg
 * Frontend looks at 127.0.0.1:3000/users/1/profile/profile_image_1_mXeiFJu.jpg
 * Actual URL is at 127.0.0.1:8000/users/1/profile/profile_image_1_mXeiFJu.jpg
 */
const Image = (props: ImageProps): JSX.Element => {
  const src = useMemo(() => {
    if (!isNil(props.src) && process.env.NODE_ENV === "development") {
      return `${process.env.REACT_APP_API_DOMAIN}${props.src}`;
    }
    return props.src;
  }, [props.src]);

  return <img {...props} alt={props.alt || "Not Found"} src={src} />;
};

export default Image;
