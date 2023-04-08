import { z } from "zod";

import { HexColor } from "./style";

export const HexColorSchema = z.custom<HexColor>(val => /^#([0-9A-Fa-f]{6})$/.test(val as string));
