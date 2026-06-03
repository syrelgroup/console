import React from "react";
import {
  CloudServerOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Button, Card, Table, Tag, Typography, Progress } from "antd";

const { Title, Text } = Typography;

// Data Dummy Grafik Riwayat Pembayaran (6 Bulan Terakhir)
const paymentHistoryData = [
  { month: "Jan", amount: 1500000, height: "h-[40%]" },
  { month: "Feb", amount: 1800000, height: "h-[50%]" },
  { month: "Mar", amount: 2400000, height: "h-[70%]" },
  { month: "Apr", amount: 2100000, height: "h-[60%]" },
  { month: "Mei", amount: 3500000, height: "h-[95%]" },
  { month: "Jun", amount: 2900000, height: "h-[80%]" },
];

// Data Dummy untuk Tabel Instance / Produk Aktif
const instanceData = [
  {
    key: "1",
    name: "Production VPS - Ubuntu",
    ip: "103.152.11.42",
    status: "Running",
    plan: "Business Pro",
  },
  {
    key: "2",
    name: "Staging DB - PostgreSQL",
    ip: "103.152.11.45",
    status: "Running",
    plan: "Standard Storage",
  },
  {
    key: "3",
    name: "Backup Node - SG",
    ip: "45.122.10.12",
    status: "Stopped",
    plan: "Basic Core",
  },
];

export default function DashboardPage() {
  // Format mata uang Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      {/* WELCOME BANNER (Disesuaikan agar pas di dalam main content area layout) */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Dashboard Konsol
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau performa layanan, tagihan, dan langganan aktif Anda hari ini.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<CloudServerOutlined />}
          className="bg-blue-600 hover:bg-blue-500 border-none font-semibold shadow-md shadow-blue-600/10 active:scale-[0.98] transition-all self-start md:self-center rounded-xl"
        >
          Beli Produk Baru
        </Button>
      </div>

      {/* GRID 1: CARD STATISTIK / UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Instance */}
        <Card
          bordered={false}
          className="shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Instance
              </Text>
              <Title
                level={2}
                className="!mt-2 !mb-0 !font-black !text-slate-800"
              >
                3{" "}
                <span className="text-sm font-normal text-slate-400">
                  Aktif
                </span>
              </Title>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <CloudServerOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              2 Running
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              1 Stopped
            </span>
          </div>
        </Card>

        {/* Card 2: Status Subscription */}
        <Card
          bordered={false}
          className="shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Subscription
              </Text>
              <Title
                level={3}
                className="!mt-2 !mb-0 !font-black text-indigo-600"
              >
                Business Pro
              </Title>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <CreditCardOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium">
              <span>Sisa Kuota Bandwidth</span>
              <span className="text-slate-600">78%</span>
            </div>
            <Progress
              percent={78}
              size="small"
              showInfo={false}
              strokeColor="#6366f1"
            />
          </div>
        </Card>

        {/* Card 3: Tunggakan Pembayaran */}
        <Card
          bordered={false}
          className="shadow-sm border border-rose-100 bg-rose-50/20 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <Text className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Tunggakan Tagihan
              </Text>
              <Title
                level={2}
                className="!mt-2 !mb-0 !font-black text-rose-600"
              >
                {formatRupiah(450000)}
              </Title>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <ExclamationCircleOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Text className="text-xs font-medium text-rose-500/80 flex items-center gap-1">
              <ClockCircleOutlined /> Jatuh tempo 3 hari lagi
            </Text>
            <Button
              type="link"
              size="small"
              danger
              className="p-0 font-bold text-xs hover:underline"
            >
              Bayar Sekarang
            </Button>
          </div>
        </Card>

        {/* Card 4: Saldo / Credit */}
        <Card
          bordered={false}
          className="shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Deposit / Credit
              </Text>
              <Title
                level={2}
                className="!mt-2 !mb-0 !font-black !text-slate-800"
              >
                {formatRupiah(1250000)}
              </Title>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <WalletOutlined className="text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <Button
              size="small"
              type="dashed"
              block
              className="text-xs border-slate-300 font-semibold text-slate-600 rounded-lg"
            >
              + Top Up Deposit
            </Button>
          </div>
        </Card>
      </div>

      {/* GRID 2: GRAFIK & SUBSCRIPTION DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Kiri & Tengah: Grafik History Pembayaran */}
        <Card
          title={
            <span className="font-extrabold text-base text-slate-800 tracking-tight">
              Grafik Histori Pembayaran
            </span>
          }
          bordered={false}
          className="shadow-sm lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <Text className="text-xs text-slate-400">
              Total pengeluaran 6 bulan terakhir
            </Text>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              Tahun 2026
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100">
            {paymentHistoryData.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center flex-1 group relative"
              >
                <div className="absolute top-[-35px] bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-md">
                  {formatRupiah(item.amount)}
                </div>
                <div
                  className={`w-full ${item.height} bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg group-hover:from-blue-500 group-hover:to-indigo-400 transition-all duration-300 shadow-sm shadow-blue-500/10`}
                />
                <span className="text-xs font-bold text-slate-500 mt-2 tracking-tight">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Kanan: Detail Paket Subscription */}
        <Card
          title={
            <span className="font-extrabold text-base text-slate-800 tracking-tight">
              Detail Langganan
            </span>
          }
          bordered={false}
          className="shadow-sm bg-gradient-to-b from-white to-slate-50/50"
        >
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-slate-950 to-blue-950 rounded-2xl text-white">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
                Paket Aktif
              </span>
              <h3 className="text-lg font-black mt-1">Syrel Enterprise Pro</h3>
              <div className="mt-4 flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Biaya/Bulan</span>
                <span className="text-xl font-bold text-white">
                  {formatRupiah(1500000)}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">ID Langganan</span>
                <span className="font-mono font-bold text-slate-700">
                  SUB-981240
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Metode Bayar</span>
                <span className="font-semibold text-slate-700">
                  Virtual Account Mandiri
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Perpanjangan</span>
                <span className="font-semibold text-slate-700">
                  24 Juni 2026
                </span>
              </div>
            </div>

            <Button
              block
              type="default"
              className="font-semibold border-slate-200 mt-2 rounded-xl"
            >
              Kelola Langganan <ArrowRightOutlined className="text-xs" />
            </Button>
          </div>
        </Card>
      </div>

      {/* GRID 3: DAFTAR INSTANCE / PRODUK AKTIF */}
      <Card
        title={
          <div className="flex justify-between items-center w-full py-1">
            <span className="font-extrabold text-base text-slate-800 tracking-tight">
              Daftar Instance & Layanan
            </span>
            <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
              Lihat Semua
            </span>
          </div>
        }
        bordered={false}
        className="shadow-sm overflow-hidden"
      >
        <Table
          dataSource={instanceData}
          pagination={false}
          className="border-none"
          columns={[
            {
              title: (
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Nama Instance
                </span>
              ),
              dataIndex: "name",
              key: "name",
              render: (text) => (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <CloudServerOutlined />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">
                    {text}
                  </span>
                </div>
              ),
            },
            {
              title: (
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  IP Address
                </span>
              ),
              dataIndex: "ip",
              key: "ip",
              render: (ip) => (
                <span className="font-mono text-xs text-slate-600 font-semibold bg-slate-50 px-2 py-1 rounded">
                  {ip}
                </span>
              ),
            },
            {
              title: (
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Paket Produk
                </span>
              ),
              dataIndex: "plan",
              key: "plan",
              render: (plan) => (
                <span className="text-slate-600 font-medium text-sm">
                  {plan}
                </span>
              ),
            },
            {
              title: (
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Status
                </span>
              ),
              dataIndex: "status",
              key: "status",
              render: (status) => (
                <Tag
                  icon={
                    status === "Running" ? (
                      <CheckCircleOutlined />
                    ) : (
                      <ClockCircleOutlined />
                    )
                  }
                  color={status === "Running" ? "success" : "default"}
                  className="rounded-full font-semibold px-2.5 py-0.5 border-none"
                >
                  {status}
                </Tag>
              ),
            },
            {
              title: "",
              key: "action",
              render: () => (
                <Button
                  type="text"
                  size="small"
                  className="text-blue-600 font-bold hover:bg-blue-50 rounded-lg"
                >
                  Kelola
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
