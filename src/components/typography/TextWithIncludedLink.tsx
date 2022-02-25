import { IncludeButtonLink } from "components/buttons";

type TextWithIncludedLinkProps = {
  readonly includeLink: IncludeLink;
  readonly children: string | undefined;
};

const TextWithIncludedLink = (props: TextWithIncludedLinkProps): JSX.Element =>
  props.children !== undefined ? (
    <span className={"text-with-included-link"}>
      {props.children}
      <IncludeButtonLink style={{ marginLeft: 6 }} includeLink={props.includeLink} />
    </span>
  ) : (
    <span></span>
  );

export default TextWithIncludedLink;
