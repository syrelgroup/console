export const calculateInstallment = (
  plafond: number,
  interestRate: number, // dalam persen (misal: 12 untuk 12%)
  tenor: number,
  type: "Fixed" | "Floating" | "KartuKredit" | "Lainnya",
): number => {
  const monthlyRate = interestRate / 100 / 12;

  switch (type) {
    case "Fixed":
      // Rumus Anuitas: P * (i * (1+i)^n) / ((1+i)^n - 1)
      if (monthlyRate === 0) return plafond / tenor;
      return (
        (plafond * (monthlyRate * Math.pow(1 + monthlyRate, tenor))) /
        (Math.pow(1 + monthlyRate, tenor) - 1)
      );

    case "Floating":
      // Estimasi awal: Floating biasanya fluktuatif.
      // Gunakan bunga saat ini sebagai dasar perhitungan.
      return plafond / tenor + plafond * monthlyRate;

    case "KartuKredit":
      // Biasanya minimum payment 5% atau nilai tertentu
      return plafond * 0.05;

    default:
      // Metode Flat (suku bunga dibagi rata ke pokok)
      return plafond / tenor + plafond * monthlyRate;
  }
};
