import type { IRuleResult, ISlikResult } from "@syrel/shared";

export const RuleCollect = (
  data: ISlikResult,
  value: number,
  score: number = 0,
): IRuleResult => {
  if (data.summary.collect > value)
    return {
      status: false,
      msg: `Kolektiblitas terburuk (${data.summary.collect}) > ${value}`,
      score,
    };
  return {
    status: true,
    msg: `Kolektiblitas terburuk (${data.summary.collect}) < ${value}`,
    score,
  };
};
export const RuleCountFacilities = (
  data: ISlikResult,
  min: number,
  max: number,
  score: number = 0,
): IRuleResult => {
  if (data.facilities.length < min)
    return {
      status: false,
      msg: `Riwayat kredit (${data.facilities.length}) < ${min}`,
      score,
    };
  if (data.summary.active_facilities_noa > max)
    return {
      status: false,
      msg: `Kredit aktif (${data.summary.active_facilities_noa}) > ${max}`,
      score,
    };
  return {
    status: true,
    msg: `Memiliki riwayat kredit (${data.facilities.length}) > ${min} dan kredit aktif (${data.summary.active_facilities_noa}) < ${max}`,
    score,
  };
};
export const RuleProblemFacilities = (
  data: ISlikResult,
  allow: boolean,
  max: number = 0,
  score: number = 0,
): IRuleResult => {
  if (!allow && data.summary.problem_facilities_noa)
    return {
      status: false,
      msg: `Terdapat Kredit bermasalah (${data.summary.problem_facilities_noa}), dengan outstanding ${data.summary.problem_facilities_os}`,
      score,
    };
  if (allow && data.summary.problem_facilities_noa > max)
    return {
      status: false,
      msg: `Terdapat Kredit bermasalah (${data.summary.problem_facilities_noa}) > ${max}, dengan outstanding ${data.summary.problem_facilities_os}`,
      score,
    };
  return {
    status: true,
    msg: `Tidak Terdapat Kredit bermasalah`,
    score,
  };
};
export const RuleOutstanding = (
  data: ISlikResult,
  max: number = 0,
  score: number = 0,
): IRuleResult => {
  if (data.summary.active_facilities_os > max)
    return {
      status: false,
      msg: `Outstanding aktif (${data.summary.active_facilities_os}) > ${max}`,
      score,
    };
  return {
    status: true,
    msg: `Outstanding aktif (${data.summary.active_facilities_os}) < ${max}`,
    score,
  };
};
