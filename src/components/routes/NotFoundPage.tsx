import { isNil } from "lodash";

interface NotFoundPageProps {
  readonly redirect?: string | true;
}

const NotFoundPage = (props: NotFoundPageProps) => (
  <div className={"not-found-page"}>
    <h1>
      {!isNil(props.redirect) && typeof props.redirect === "string"
        ? props.redirect
        : "The requested resource could not be found."}
    </h1>
  </div>
);

export default NotFoundPage;
