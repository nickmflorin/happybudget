import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

import { IconButton } from "components/control/buttons";
import "./TableFooter.scss";

interface TableFooterProps {
  text: string;
  onNew: () => void;
}

const TableFooter = ({ text, onNew }: TableFooterProps): JSX.Element => {
  return (
    <div className={"table-footer"}>
      <IconButton
        className={"green"}
        size={"small"}
        icon={<FontAwesomeIcon icon={faPlusCircle} />}
        onClick={() => onNew()}
      />
      <span className={"noto-sans--medium ml--10"}>{text}</span>
    </div>
  );
};

export default TableFooter;
