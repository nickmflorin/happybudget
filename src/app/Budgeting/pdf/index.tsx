import { pdf } from "@react-pdf/renderer";

import * as api from "api";
import { registerFonts } from "style/pdf";

import BudgetPdf from "./Pdf";

export const generatePdf = async (budgetId: number) => {
  const [budget, contacts]: [Model.PdfBudget, Http.ListResponse<Model.Contact>] = await Promise.all([
    api.getBudgetPdf(budgetId),
    api.getContacts()
  ]);
  registerFonts();
  const pdfComponent = BudgetPdf(budget, contacts.data, { excludeZeroTotals: true });
  return await pdf(pdfComponent).toBlob();
};
