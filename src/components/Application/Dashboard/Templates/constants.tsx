import { CommercialIcon, DocumentaryIcon, EpisodicIcon, FilmIcon, MusicVideoIcon } from "components/svgs";

export interface TemplateConfig {
  icon: JSX.Element;
  text: string;
  productionType: ProductionType;
  color: string;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    icon: <FilmIcon />,
    text: "Film",
    productionType: 0,
    color: "#eba689"
  },
  {
    icon: <EpisodicIcon />,
    text: "Episodic",
    productionType: 1,
    color: "#77b9df"
  },
  {
    icon: <MusicVideoIcon />,
    text: "Music Video",
    productionType: 2,
    color: "#d27786"
  },
  {
    icon: <CommercialIcon />,
    text: "Commercial",
    productionType: 3,
    color: "#58b97e"
  },
  {
    icon: <DocumentaryIcon />,
    text: "Documentary",
    productionType: 4,
    color: "#f5d864"
  },
  {
    icon: <CommercialIcon />,
    text: "Custom",
    productionType: 5,
    color: "#cccccc"
  }
];
