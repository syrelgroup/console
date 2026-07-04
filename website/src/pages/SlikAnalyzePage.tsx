// src/pages/SlikAnalyzer.tsx
import React, { useMemo, useState } from "react";
import {
  Upload,
  Button,
  Card,
  Progress,
  Alert,
  Spin,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  Table,
  Empty,
  Tooltip,
  Divider,
  theme, // Tetap diperlukan untuk properti internal seperti internal strokeColor Progress
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FileSearch,
  UploadCloud,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  ShieldAlert,
  CheckSquare,
  User,
  Wallet,
  Calendar,
  Landmark,
  Printer,
} from "lucide-react";
import { IFacilities, IRuleResult, ISlikResult } from "@syrel/shared";
import { printAnalyzeSlik } from "../components/pdfs/printSlikAnalyze";

export interface ApiResponse {
  msg: string;
  data: ISlikResult;
  rulesmessage: IRuleResult[];
  score: number;
}

// ---- Helpers ----------------------------------------------------------

const formatRp = (value: number | null | undefined) =>
  `Rp ${Number(value?.toFixed(2) ?? 0).toLocaleString("id-ID")}`;

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const d = new Date(value as string);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const COLLECT_INFO: Record<number, { label: string; color: string }> = {
  1: { label: "KOL 1 - Lancar", color: "green" },
  2: { label: "KOL 2 - DPK", color: "blue" },
  3: { label: "KOL 3 - Kurang Lancar", color: "orange" },
  4: { label: "KOL 4 - Diragukan", color: "volcano" },
  5: { label: "KOL 5 - Macet", color: "red" },
};

const getCollectInfo = (collect: number) =>
  COLLECT_INFO[collect] ?? { label: `KOL ${collect}`, color: "default" };

const getGradeInfo = (score: number) => {
  if (score >= 85)
    return { grade: "A", color: "#22c55e", status: "Sangat Baik" };
  if (score >= 70) return { grade: "B", color: "#3b82f6", status: "Baik" };
  if (score >= 50)
    return { grade: "C", color: "#eab308", status: "Cukup / Perhatian" };
  if (score >= 30)
    return { grade: "D", color: "#f97316", status: "Kurang Baik" };
  return { grade: "E", color: "#ef4444", status: "Risiko Tinggi" };
};

// ---- Facilities table ---------------------------------------------------

const FacilitiesTable: React.FC<{ data: IFacilities[] }> = ({ data }) => {
  const { token } = theme.useToken(); // Mengambil token token antd agar warna bar internal singkron

  const columns: ColumnsType<IFacilities> = [
    {
      title: "Fasilitas",
      dataIndex: "name",
      key: "name",
      render: (name: string, row) => (
        <div className="flex items-start gap-2">
          <Landmark className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-200">
              {name || "Tidak diketahui"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Plafon / Outstanding",
      key: "amount",
      sorter: (a, b) => a.os - b.os,
      render: (_, row) => {
        const pct =
          row.plafond > 0 ? Math.min(100, (row.os / row.plafond) * 100) : 0;
        return (
          <div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{formatRp(row.os)}</span>
              <span className="text-gray-300 dark:text-gray-600">
                / {formatRp(row.plafond)}
              </span>
            </div>
            <Progress
              percent={pct}
              showInfo={false}
              size="small"
              strokeColor={
                pct > 80
                  ? token.colorError
                  : pct > 50
                    ? token.colorWarning
                    : token.colorPrimary
              }
            />
          </div>
        );
      },
    },
    {
      title: "Angsuran",
      dataIndex: "angsuran",
      key: "angsuran",
      render: (_, record) => (
        <div>
          <div>
            <Tag>
              {record.interest_rate}% {record.interest_type}
            </Tag>
          </div>
          <div>
            <Tag color={"blue"}>{formatRp(record.installment || 0)}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: boolean, record) => (
        <div>
          <Tag
            color={
              record.collect === 2
                ? "blue"
                : record.collect > 2
                  ? "red"
                  : "green"
            }
          >
            Kol {record.collect} {record.collect_label}
          </Tag>
          <Tag color={status ? "cyan" : "default"}>
            {status ? "Aktif" : "Non-Aktif"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Periode",
      key: "periode",
      render: (_, row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {formatDate(row.start_at)} &rarr; {formatDate(row.end_at)}
          </span>
        </div>
      ),
    },
  ];

  if (!data || data.length === 0) {
    return (
      <Empty
        description="Tidak ada fasilitas pada kategori ini"
        className="py-8"
      />
    );
  }

  return (
    <Table
      rowKey={(row, idx) => `${row.name}-${idx}`}
      columns={columns}
      dataSource={data}
      size="small"
      pagination={data.length > 8 ? { pageSize: 8 } : false}
      className="mt-2"
      scroll={{ x: true }}
    />
  );
};

const InfoField: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg p-3 border border-gray-100 dark:border-zinc-700 min-w-0">
    <div className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
      {label}
    </div>
    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 wrap-break-word leading-snug">
      {value}
    </div>
  </div>
);

// ---- Main component -------------------------------------------------------

export const SlikAnalyzer: React.FC = () => {
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/ai/bank/slik", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal memproses file.");
      const data: ApiResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError("Gagal menganalisis SLIK. Pastikan file PDF valid.");
    } finally {
      setLoading(false);
    }
  };

  const facilities = result?.data?.facilities ?? [];

  const {
    activeFacilities,
    problemFacilities,
    inactiveFacilities,
    nplPercentage,
  } = useMemo(() => {
    const active = facilities.filter((f) => f.status === true);
    const problem = facilities.filter((f) => f.collect >= 3);
    const inactive = facilities.filter((f) => f.status === false);

    // Kalkulasi NPL: (Total OS Fasilitas Macet / Total OS Seluruh Fasilitas) * 100
    const totalOS = facilities.reduce((sum, f) => sum + f.os, 0);
    const problemOS = problem.reduce((sum, f) => sum + f.os, 0);
    const npl = totalOS > 0 ? (problemOS / totalOS) * 100 : 0;

    return {
      activeFacilities: active,
      problemFacilities: problem,
      inactiveFacilities: inactive,
      nplPercentage: npl,
    };
  }, [facilities]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spin size="large" />
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
          Mengekstrak & Menganalisis SLIK via OCR...
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Proses ini memakan waktu 10-30 detik
        </p>
      </div>
    );
  }

  const gradeInfo = result ? getGradeInfo(result.score) : null;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-gray-800 dark:text-gray-200">
      {/* Header Banner */}
      {!result && (
        <div className="text-center py-8 bg-linear-to-r from-blue-50/50 via-indigo-50/50 to-blue-50/50 dark:from-zinc-800/40 dark:via-zinc-800/60 dark:to-zinc-800/40 rounded-2xl border border-blue-100 dark:border-zinc-700 shadow-sm mb-4">
          <FileSearch className="w-14 h-14 mx-auto text-blue-600 dark:text-blue-400 mb-3" />
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            SLIK Credit Scoring Analyzer
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-1 text-sm sm:text-base">
            Unggah salinan PDF SLIK OJK untuk mendapatkan visualisasi metrik
            finansial, deteksi risiko, dan penilaian kelayakan kredit instan.
          </p>
        </div>
      )}

      {!result && (
        <Card className="max-w-xl mx-auto shadow-md rounded-xl border-dashed border-2 dark:bg-zinc-900 dark:border-zinc-700">
          <Upload.Dragger
            accept=".pdf"
            customRequest={({ file }) => handleUpload(file as File)}
            showUploadList={false}
            className="dark:bg-transparent"
          >
            <UploadCloud className="w-14 h-14 mx-auto text-blue-500 mb-3" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Klik atau seret file SLIK ke sini
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Mendukung format PDF resmi dari OJK / iDeb
            </p>
          </Upload.Dragger>
        </Card>
      )}

      {error && (
        <Alert
          message="Analisis Gagal"
          description={error}
          type="error"
          showIcon
          className="max-w-xl mx-auto rounded-lg"
        />
      )}

      {result && gradeInfo && (
        <div className="space-y-6 dynamic-fade-in">
          {/* Main Dashboard Panel: Scoring & Profile */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card
                className="text-center h-full shadow-sm flex flex-col justify-center items-center border-t-4 dark:bg-zinc-900 dark:border-zinc-700"
                style={{ borderTopColor: gradeInfo.color }}
              >
                <h3 className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider text-xs mb-4">
                  Kelayakan Kredit
                </h3>
                <Progress
                  type="circle"
                  percent={result.score}
                  strokeColor={gradeInfo.color}
                  format={() => (
                    <div>
                      <div
                        className="text-4xl font-extrabold"
                        style={{ color: gradeInfo.color }}
                      >
                        {gradeInfo.grade}
                      </div>
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                        {result.score} / 100
                      </div>
                    </div>
                  )}
                  size={160}
                />
                <div className="mt-4">
                  <Tag
                    color={
                      result.score >= 70
                        ? "green"
                        : result.score >= 50
                          ? "warning"
                          : "red"
                    }
                    className="px-3 py-1 text-sm font-semibold rounded"
                  >
                    {gradeInfo.status}
                  </Tag>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={16}>
              <Card
                title={
                  <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <User className="w-5 h-5 text-blue-500" />
                    <span>Informasi Debitur</span>
                  </div>
                }
                className="h-full shadow-sm dark:bg-zinc-900 dark:border-zinc-700"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoField
                    label="Nama Debitur"
                    value={result.data.debitur?.fullname || "Tidak Terdeteksi"}
                  />
                  <InfoField
                    label="Nomor Identitas"
                    value={result.data.debitur?.nik || "-"}
                  />
                  <InfoField
                    label="Kolektibilitas Tertinggi"
                    value={
                      <Tag
                        color={
                          getCollectInfo(result.data.summary.collect).color
                        }
                      >
                        {getCollectInfo(result.data.summary.collect).label}
                      </Tag>
                    }
                  />
                  <InfoField
                    label="Total Fasilitas"
                    value={`${result.data.summary.total_facilities} Kontrak`}
                  />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Financial Breakdown Cards */}
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />{" "}
            Ringkasan Portofolio Kredit
          </h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm border-l-4 border-l-blue-500 bg-slate-50 dark:bg-zinc-900 dark:border-zinc-700">
                <Statistic
                  title={
                    <span className="dark:text-gray-400">
                      <Wallet className="w-4 h-4 inline mr-1 -mt-1 text-blue-500" />{" "}
                      Total Plafon
                    </span>
                  }
                  value={result.data.summary.total_plafond}
                  precision={0}
                  formatter={(v) => formatRp(Number(v))}
                  valueStyle={{ fontSize: "1.25rem", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm border-l-4 border-l-indigo-500 bg-slate-50 dark:bg-zinc-900 dark:border-zinc-700">
                <Statistic
                  title={
                    <span className="dark:text-gray-400">
                      Total Baki Debet (OS)
                    </span>
                  }
                  value={result.data.summary.total_os}
                  precision={0}
                  formatter={(v) => formatRp(Number(v))}
                  valueStyle={{ fontSize: "1.25rem", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm border-l-4 border-l-green-500 bg-slate-50 dark:bg-zinc-900 dark:border-zinc-700">
                <Statistic
                  title={
                    <span className="dark:text-gray-400">
                      Fasilitas Lunas (NOA)
                    </span>
                  }
                  value={result.data.summary.paid_facilities_noa}
                  suffix="Kontrak"
                  valueStyle={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: "#22c55e",
                  }}
                />
              </Card>{" "}
              {/* <-- SEBELUMNYA DI SINI SALAH TULIS MENJADI </Col> */}
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm border-l-4 border-l-red-500 bg-slate-50 dark:bg-zinc-900 dark:border-zinc-700">
                <Statistic
                  title={
                    <span className="dark:text-gray-400">
                      Plafon Kredit Macet
                    </span>
                  }
                  value={result.data.summary.problem_facilities_plafond}
                  precision={0}
                  formatter={(v) => formatRp(Number(v))}
                  valueStyle={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: "#ef4444",
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-sm border-l-4 border-l-orange-500 bg-slate-50 dark:bg-zinc-900 dark:border-zinc-700">
                <Statistic
                  title={<span className="dark:text-gray-400">Rasio NPL</span>}
                  value={nplPercentage}
                  precision={2}
                  suffix="%"
                  valueStyle={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: nplPercentage > 5 ? "#ef4444" : "#f97316", // Merah jika NPL tinggi, orange jika sedang
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Tabular Analysis Strategy (Active vs Problem vs Inactive) + Facility lists */}
          <Card
            className="shadow-sm dark:bg-zinc-900 dark:border-zinc-700"
            title={
              <span className="dark:text-gray-200">
                Segmentasi & Daftar Fasilitas
              </span>
            }
          >
            <Tabs defaultActiveKey="active" type="card">
              <Tabs.TabPane
                tab={
                  <span className="flex items-center gap-1">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Fasilitas Aktif ({activeFacilities.length})
                  </span>
                }
                key="active"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }}>
                  <Descriptions.Item label="Jumlah Kontrak">
                    {result.data.summary.active_facilities_noa}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Plafon">
                    {formatRp(result.data.summary.active_facilities_plafond)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Sisa Baki Debet (OS)">
                    {formatRp(result.data.summary.active_facilities_os)}
                  </Descriptions.Item>
                </Descriptions>
                <Divider className="my-3" />
                <FacilitiesTable data={activeFacilities} />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    Fasilitas Bermasalah ({problemFacilities.length})
                  </span>
                }
                key="problem"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }}>
                  <Descriptions.Item label="Jumlah Kontrak Macet">
                    <span
                      className={
                        result.data.summary.problem_facilities_noa > 0
                          ? "text-red-500 font-bold"
                          : ""
                      }
                    >
                      {result.data.summary.problem_facilities_noa}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Plafon Bermasalah">
                    {formatRp(result.data.summary.problem_facilities_plafond)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Baki Debet Bermasalah">
                    {formatRp(result.data.summary.problem_facilities_os)}
                  </Descriptions.Item>
                </Descriptions>
                <Divider className="my-3" />
                <FacilitiesTable data={problemFacilities} />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-4 h-4 text-gray-500" />
                    Historis / Non-Aktif ({inactiveFacilities.length})
                  </span>
                }
                key="inactive"
              >
                <Descriptions bordered size="small" column={{ xs: 1, sm: 3 }}>
                  <Descriptions.Item label="Jumlah Histori">
                    {result.data.summary.inactive_facilities_noa}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Historis Plafon">
                    {formatRp(result.data.summary.inactive_facilities_plafond)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Outstanding Lunas">
                    {formatRp(result.data.summary.inactive_facilities_os)}
                  </Descriptions.Item>
                </Descriptions>
                <Divider className="my-3" />
                <FacilitiesTable data={inactiveFacilities} />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span className="flex items-center gap-1">
                    <Landmark className="w-4 h-4 text-blue-500" />
                    Semua Fasilitas ({facilities.length})
                  </span>
                }
                key="all"
              >
                <FacilitiesTable data={facilities} />
              </Tabs.TabPane>
            </Tabs>
          </Card>

          {/* Rule Messages & System Findings */}
          <Card
            title={
              <span className="dark:text-gray-200">
                Hasil Aturan (Rules Validation) & Catatan Risiko
              </span>
            }
            className="shadow-sm border-gray-200 dark:bg-zinc-900 dark:border-zinc-700"
          >
            <div className="space-y-3">
              {result.rulesmessage && result.rulesmessage.length > 0 ? (
                result.rulesmessage.map((rule, index) => {
                  if (!rule) return null;
                  const isNegative = !rule.status;
                  return (
                    <Alert
                      key={index}
                      message={rule.msg}
                      type={isNegative ? "warning" : "info"}
                      showIcon
                      icon={
                        isNegative ? (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )
                      }
                      className="rounded-lg"
                    />
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Tidak ada catatan pelanggaran rule spesifik.
                </p>
              )}
            </div>
          </Card>

          {/* Bottom Printing Area */}
          <div className="my-4 flex justify-between items-center p-4 rounded-xl border border-gray-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xs">
            <div>
              <h2 className="text-lg font-bold m-0 text-gray-800 dark:text-gray-200">
                Hasil Analisis Valid
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 m-0">
                Data siap dicetak ke format dokumen fisik / PDF
              </p>
            </div>
            <Button
              type="primary"
              icon={<Printer className="w-4 h-4" />}
              size="large"
              className="bg-emerald-600 hover:bg-emerald-700 border-none flex items-center gap-2"
              onClick={() =>
                printAnalyzeSlik(result.data, result.score, result.rulesmessage)
              }
            >
              Cetak Hasil Analisa SLIK
            </Button>
          </div>
          {/* Bottom Action Trigger */}
          <div className="text-center pt-4">
            <Tooltip title="Reset hasil dan unggah file SLIK lainnya">
              <Button
                type="primary"
                size="large"
                onClick={() => setResult(null)}
                className="shadow-md bg-blue-600 hover:bg-blue-700"
              >
                Analisis Ulang File SLIK Baru
              </Button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlikAnalyzer;
