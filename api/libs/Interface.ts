export interface IDebitur {
  fullname: string | null;
  nik: string | null;
  gender: string | null;
  birthplace: string | null;
  birthdate: string | null;
  npwp: string | null;
  address: string | null;
}

export interface IFacilities {
  name: string;
  os: number;
  plafond: number;
  condition: string;
  start_at: String | null;
  end_at: String | null;
  collect: number;
  status: boolean;
}

export interface ISummary {
  collect: number;
  total_plafond: number;
  total_os: number;
  total_facilities: number;
  active_facilities_plafond: number;
  active_facilities_os: number;
  active_facilities_noa: number;
  problem_facilities_plafond: number;
  problem_facilities_os: number;
  problem_facilities_noa: number;
  inactive_facilities_plafond: number;
  inactive_facilities_os: number;
  inactive_facilities_noa: number;
  paid_facilities_plafond: number;
  paid_facilities_noa: number;
}

export interface ISlikResult {
  debitur: IDebitur;
  summary: ISummary;
  facilities: IFacilities[];
}

export interface IRuleResult {
  status: boolean;
  msg: string;
  score: number;
}
