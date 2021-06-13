import { pdf } from "@react-pdf/renderer";

import * as api from "api";

import BudgetPdf from "./Pdf";
import { registerFonts } from "./Styles";

export const generatePdf = async (budgetId: number) => {
  const response: Model.PdfBudget = await api.getBudgetPdf(budgetId);
  registerFonts();
  const pdfComponent = BudgetPdf(response, { excludeZeroTotals: true });
  return await pdf(pdfComponent).toBlob();
};
