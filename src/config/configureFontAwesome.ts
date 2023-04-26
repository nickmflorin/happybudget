import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { IconPack, IconDefinition } from "@fortawesome/fontawesome-common-types";

const configureFontAwesome = () => {
  library.add(fas, far, fab);
};

export default configureFontAwesome;
