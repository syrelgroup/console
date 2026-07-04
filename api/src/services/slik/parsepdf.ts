import { PDFParse } from "pdf-parse";
import {
  getSummary,
  normalizeText,
  parseDebitur,
  parseFacility,
} from "./utils.js";
import type { ISlikResult, ISummary } from "@syrel/shared";

export async function ExtractText(buffer: Buffer): Promise<ISlikResult> {
  try {
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();

    const result = GenerateJSONSLIK(parsed.text);

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const GenerateJSONSLIK = (rawtext: string): ISlikResult => {
  const normalize = normalizeText(rawtext);
  const debitur = parseDebitur(normalize);
  const summary = getSummary(normalize);

  const pages = rawtext
    .split(/-- \d+ of \d+ --/)
    .map((x) => x.trim())
    .filter(Boolean);

  const facilities = pages
    .slice(1)
    .map((p) => parseFacility(p))
    .filter((x) => Object.keys(x).length > 0);

  const actives = facilities.filter((f) => f.status);
  const paids = facilities.filter(
    (f) => !f.status && f.condition.toLowerCase() === "lunas",
  );
  const inactives = facilities.filter(
    (f) => !f.status && f.condition.toLowerCase() !== "Dihapusbukukan",
  );
  const problems = facilities.filter((f) => f.collect > 2);

  const result: ISummary = {
    ...summary,
    total_facilities: facilities.length,
    active_facilities_plafond: actives.reduce((a, b) => a + b.plafond, 0),
    active_facilities_os: actives.reduce((a, b) => a + b.os, 0),
    active_facilities_noa: actives.length,
    paid_facilities_plafond: paids.reduce((a, b) => a + b.plafond, 0),
    paid_facilities_noa: paids.length,
    inactive_facilities_plafond: inactives.reduce((a, b) => a + b.plafond, 0),
    inactive_facilities_os: inactives.reduce((a, b) => a + b.os, 0),
    inactive_facilities_noa: inactives.length,
    problem_facilities_plafond: problems.reduce((a, b) => a + b.plafond, 0),
    problem_facilities_os: problems.reduce((a, b) => a + b.os, 0),
    problem_facilities_noa: problems.length,
  };
  return {
    debitur,
    summary: result,
    facilities,
  };
};
