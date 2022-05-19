import { library, IconDefinition, IconPack } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/pro-solid-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { fal } from "@fortawesome/pro-light-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";

const configureFontAwesome = () => {
  library.add(
    fas as IconDefinition | IconPack,
    far as IconDefinition | IconPack,
    fal as IconDefinition | IconPack,
    fab as IconDefinition | IconPack
  );
};

export default configureFontAwesome;
