export interface SlikData {
  nasabah: {
    nama: string;
    nik?: string;
    npwp?: string;
    tanggalLahir?: string;
  };
  fasilitasKredit: FasilitasKredit[];
  dpk?: DPKInfo;
  summary: {
    totalPlafon: number;
    totalOutstanding: number;
    jumlahFasilitasAktif: number;
    jumlahBankRelations: number;
  };
}

export interface FasilitasKredit {
  bank: string;
  jenisKredit: string; // 'KPR', 'KKB', 'KMK', 'Kartu Kredit', etc
  plafon: number;
  outstanding: number;
  kolektibilitas: number; // 1-5
  tanggalMulai: string;
  tanggalJatuhTempo: string;
  riwayatPembayaran?: PembayaranBulanan[];
}

export interface PembayaranBulanan {
  bulan: string;
  status: "TEPAT" | "TERLAMBAT" | "MACET";
  hariKeterlambatan?: number;
}

export interface DPKInfo {
  totalTabungan: number;
  totalDeposito: number;
  totalGiro: number;
}

export interface ScoringResult {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "E";
  kategori: string;
  detailScores: {
    kolektibilitasScore: number;
    dtiScore: number; // Debt to Income proxy
    utilizationScore: number;
    historyScore: number;
    diversificationScore: number;
  };
  ringkasan: string;
  risikoUtama: string[];
  rekomendasi: string;
  summary: SlikSummary;
}

export interface SlikSummary {
  totalFasilitas: number;
  totalOutstanding: number;
  kolektibilitasRataRata: number;
  fasilitasTerbesar: string;
  bankUtama: string;
  riwayatPembayaranTerburuk: string;
  adaKreditMacet: boolean;
}
