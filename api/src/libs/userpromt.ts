import { ocrschema } from "./schema.js";

export const userpromtocr = (rawtext: string) => `
Schema:
${JSON.stringify(ocrschema, null, 2)}

OCR Text:
${rawtext}
`;

export const userpromtverif = (ocrData: object, inputuser: object) => `
OCR Data:
${JSON.stringify(ocrData, null, 2)}

User Input:
${JSON.stringify(inputuser, null, 2)}
`;

export const userpromtslik = (rawtext: string) => `
OCR Text:
${rawtext}
`;
