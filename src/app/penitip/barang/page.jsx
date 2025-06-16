"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, EllipsisVertical } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PenitipBarangPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/me");

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
          } else {
            setUser(null);
            router.push("/login");
          }
        } else {
          setUser(null);
          if (res.status === 401) {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [router]);

  // BARANG
  useEffect(() => {
    const fetchBarangPenitip = async () => {
      try {
        const res = await fetch(
          `/api/barang/by-penitip?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setBarangList(data.barang || []);
      } catch (err) {
        console.error("Gagal mengambil barang:", err);
      }
    };

    fetchBarangPenitip();
  }, [searchQuery]);

  // DROPDOWN
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".dropdown-action")) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : "";
  };

  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(date)
      .replace(".", "");
  }

  const handleAjukanPerpanjangan = async (id_barang) => {
    const barang = barangList.find((b) => b.id_barang === id_barang);
    if (!barang || !barang.tanggal_expire) {
      alert("Data barang tidak valid.");
      return;
    }

    try {
      const tanggalLama = new Date(barang.tanggal_expire);
      const tanggalBaru = new Date(
        tanggalLama.setDate(tanggalLama.getDate() + 30)
      );

      const res = await fetch(`/api/barang/by-penitip/${id_barang}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tanggal_expire: tanggalBaru.toISOString().split("T")[0],
          status_titip: "EXTENDED",
          is_extended: 1,
        }),
      });

      if (!res.ok) throw new Error("Gagal memperpanjang barang.");

      alert("Perpanjangan berhasil diajukan!");

      setBarangList((prev) =>
        prev.map((item) =>
          item.id_barang === id_barang
            ? {
                ...item,
                tanggal_expire: tanggalBaru.toISOString().split("T")[0],
                status_titip: "EXTENDED",
                is_extended: 1,
              }
            : item
        )
      );
      setShowDetailModal(false);
    } catch (err) {
      console.error("Error perpanjangan:", err);
      alert("Terjadi kesalahan saat memperpanjang.");
    }
  };

  const handleAjukanPengembalian = async (id_barang) => {
    try {
      const res = await fetch(`/api/barang/by-penitip/picked/${id_barang}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status_titip: "READY_PICK_UP",
        }),
      });

      if (!res.ok) throw new Error("Gagal mengajukan pengembalian");

      alert(
        "Barang siap dikembalikan. Status telah diperbarui ke READY_PICK_UP."
      );
      setShowDetailModal(false);

      setBarangList((prev) =>
        prev.map((item) =>
          item.id_barang === id_barang
            ? { ...item, status_titip: "READY_PICK_UP" }
            : item
        )
      );
    } catch (err) {
      console.error("Error pengembalian:", err);
      alert("Terjadi kesalahan saat mengajukan pengembalian.");
    }
  };

  return (
    <div className="p-6 relative">
      {
        /* Main Content */
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-[Montage-Demo]">Barang Titipan</h2>
          <div className="flex items-center gap-4">
            {isClient && (
              <div className="font-mono text-lg text-gray-800 flex gap-2">
                <div>
                  {currentTime.toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div>{currentTime.toLocaleTimeString("id-ID")}</div>
              </div>
            )}

            <div
              className="p-1 rounded-full cursor-pointer flex items-center justify-center w-12 h-12"
              onClick={() => router.push("/penitip/profile")}
              style={{
                background:
                  "radial-gradient(ellipse 130.87% 392.78% at 121.67% 0%, #26C2FF 0%, #220593 90%)",
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                {user && user.src_img_profile ? (
                  <img
                    src={user.src_img_profile}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : user ? (
                  <span className="text-white text-lg font-semibold">
                    {getFirstLetter(user.nama)}
                  </span>
                ) : (
                  <div className="animate-pulse w-full h-full bg-gray-300 rounded-full" />
                )}
              </div>
            </div>
          </div>
        </div>
      }

      {/* Tabs */}
      <Tabs defaultValue="semua" className="mb-4">
        <TabsList className="flex gap-4">
          {[
            "Semua",
            "Sedang Dititipkan",
            "Masa Titip Habis",
            "Dalam Transaksi",
            "Terjual",
            "Didonasikan",
          ].map((tab) => (
            <TabsTrigger key={tab} value={tab.toLowerCase().replace(/ /g, "-")}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center mb-6">
        <Input
          placeholder="Cari kode atau nama barang"
          className="w-1/3"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="relative">
          <Button variant="outline" className="flex items-center gap-2">
            Tanggal Masuk <CalendarIcon size={16} />
          </Button>
        </div>
        <Input type="date" className="w-1/4" />
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[60px_1fr_140px_140px_140px_140px_100px_80px] text-white p-4 rounded-xl font-semibold text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
        <div>Kode</div>
        <div>Nama</div>
        <div>Harga</div>
        <div>Tanggal Masuk</div>
        <div>Tanggal Expire</div>
        <div>Tanggal Terbeli</div>
        <div>Status</div>
        <div className="flex justify-center">Action</div>
      </div>

      {/* Items */}
      {barangList.length === 0 ? (
        <div className="flex flex-row justify-center p-4 mt-3 rounded-xl border-1 border-black text-sm">
          <p>Kamu belum menitipkan barang. Yuk titipin barangmu sekarang!</p>
        </div>
      ) : (
        <div>
          {barangList.map((item) => (
            <div
              key={item.id_barang}
              className="grid grid-cols-[60px_1fr_140px_140px_140px_140px_100px_80px] p-4 mt-3 rounded-xl border border-black text-sm"
            >
              <div>{item.kode_produk}</div>
              <div className="truncate">{item.nama_barang}</div>
              <div className="truncate">{formatRupiah(item.harga_barang)}</div>
              <div>{formatDate(item.tanggal_masuk)}</div>
              <div>{formatDate(item.tanggal_expire)}</div>
              <div>
                {item.tanggal_keluar ? formatDate(item.tanggal_keluar) : "-"}
              </div>
              <div>{item.status_titip}</div>
              <div className="flex justify-center items-center">
                <div className="relative dropdown-action">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === item.id_barang
                          ? null
                          : item.id_barang
                      )
                    }
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    <EllipsisVertical />
                  </button>

                  {/* Dropdown yang hanya muncul jika ID-nya cocok */}
                  {activeDropdown === item.id_barang && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                      <button
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => {
                          setSelectedBarang(item);
                          setShowDetailModal(true);
                        }}
                      >
                        Detail
                      </button>
                      <button
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                        onClick={() => handleDelete(item.id_barang)}
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="mt-6 flex justify-center items-center gap-2">
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="ghost" size="sm">
              ▶
            </Button>
          </div>
        </div>
      )}

      {showDetailModal && selectedBarang && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white fixed right-0 p-6 w-full max-w-3xl h-full overflow-y-auto shadow-lg">
            <h2 className="text-lg font-bold mb-4">Detail Barang Titipan</h2>

            <div className="space-y-3 text-sm text-gray-800">
              <p>
                <strong>Kode Produk:</strong> {selectedBarang.kode_produk}
              </p>
              <p>
                <strong>Nama Barang:</strong> {selectedBarang.nama_barang}
              </p>
              <p>
                <strong>Deskripsi:</strong> {selectedBarang.deskripsi_barang}
              </p>
              <p>
                <strong>Harga:</strong>{" "}
                {formatRupiah(selectedBarang.harga_barang)}
              </p>
              <p>
                <strong>Status Titip:</strong> {selectedBarang.status_titip}
              </p>
              <p>
                <strong>Tanggal Masuk:</strong>{" "}
                {formatDate(selectedBarang.tanggal_masuk)}
              </p>
              <p>
                <strong>Tanggal Keluar:</strong>{" "}
                {selectedBarang.tanggal_keluar
                  ? formatDate(selectedBarang.tanggal_keluar)
                  : "-"}
              </p>
              <p>
                <strong>Tanggal Expire:</strong>{" "}
                {selectedBarang.tanggal_expire
                  ? formatDate(selectedBarang.tanggal_expire)
                  : "-"}
              </p>
              <p>
                <strong>Tanggal Garansi:</strong>{" "}
                {selectedBarang.tanggal_garansi
                  ? formatDate(selectedBarang.tanggal_garansi)
                  : "-"}
              </p>
              <p>
                <strong>Penitip:</strong> {selectedBarang.penitip_name}
              </p>

              {selectedBarang.gambar_barang?.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {selectedBarang.gambar_barang.map((img) => (
                    <img
                      key={img.id_gambar}
                      src={img.src_img}
                      alt="gambar"
                      className="w-full h-32 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-5">
              {isClient &&
                (() => {
                  const expireDate = new Date(selectedBarang.tanggal_expire);
                  const today = new Date(currentTime);
                  expireDate.setHours(0, 0, 0, 0);
                  today.setHours(0, 0, 0, 0);
                  const selisihHari = Math.ceil(
                    (expireDate - today) / (1000 * 60 * 60 * 24)
                  );

                  const isH3OrLess = selisihHari <= 3;
                  const isAvailable =
                    selectedBarang.status_titip?.toLowerCase() === "available";

                  return isH3OrLess && isAvailable;
                })() && (
                  <div className="mt-6">
                    <button
                      onClick={() =>
                        handleAjukanPerpanjangan(selectedBarang.id_barang)
                      }
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Ajukan Perpanjangan
                    </button>
                  </div>
                )}

              {isClient &&
                (() => {
                  const allowedStatuses = ["available", "extended", "expired"];
                  const status = selectedBarang.status_titip?.toLowerCase();

                  if (!allowedStatuses.includes(status)) return false;

                  const expireDate = new Date(selectedBarang.tanggal_expire);
                  const today = new Date(currentTime);
                  expireDate.setHours(0, 0, 0, 0);
                  today.setHours(0, 0, 0, 0);

                  const daysSinceExpire = Math.floor(
                    (today - expireDate) / (1000 * 60 * 60 * 24)
                  );

                  if (status === "expired" && daysSinceExpire > 7) return false;

                  return true;
                })() && (
                  <div className="mt-6">
                    <button
                      onClick={() =>
                        handleAjukanPengembalian(selectedBarang.id_barang)
                      }
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Ajukan Pengembalian
                    </button>
                  </div>
                )}
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedBarang(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
