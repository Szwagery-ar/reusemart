"use client";

import { useEffect, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminRequestDonasiPage() {
  const [requestDonasiList, setRequestDonasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchBarang, setSearchBarang] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState([]);
  const [barangDonasiList, setBarangDonasiList] = useState([]);

  const formatTanggal = (tanggalString) => {
    const tanggal = new Date(tanggalString);

    const namaBulan = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    const hari = tanggal.getDate().toString().padStart(2, "0");
    const bulan = namaBulan[tanggal.getMonth()];
    const tahun = tanggal.getFullYear();

    const jam = tanggal.getHours().toString().padStart(2, "0");
    const menit = tanggal.getMinutes().toString().padStart(2, "0");

    return `${hari} ${bulan} ${tahun}, ${jam}:${menit}`;
  };

  useEffect(() => {
    const fetchRequestDonasi = async () => {
      try {
        const res = await fetch(
          `/api/requestdonasi?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        if (res.ok) {
          setRequestDonasiList(data.requestDonasi);
        } else {
          setError(data.error || "Gagal mengambil data request donasi");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDonasi();
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-action")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBarang();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchBarang]);

  const handleEdit = (item) => {
    if (item.status_request === "REJECTED") {
      alert("Request dengan status REJECTED tidak dapat diatur.");
      return;
    }
    setEditData(item);
    setShowSidebar(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const updateData = {
      id_request: editData.id_request,
      tanggal_request: editData.tanggal_request,
      deskripsi: editData.deskripsi,
      status_request: mode === "reject" ? "REJECTED" : "APPROVED",
      mode,
      daftarBarang: barangDonasiList.map((b) => b.id_barang),
    };

    const res = await fetch("/api/requestdonasi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (res.ok) {
      setRequestDonasiList((prev) =>
        prev.map((item) =>
          item.id_request === editData.id_request
            ? { ...item, ...updateData }
            : item
        )
      );
      setShowSidebar(false);
      setMode(null);
      alert("Data berhasil diperbarui");
    } else {
      alert("Gagal memperbarui data");
    }
  };

  const fetchBarang = async () => {
    if (searchBarang.trim() === "") return;
    try {
      const res = await fetch(
        `/api/barang/by-owner?q=${encodeURIComponent(searchBarang)}`
      );
      const data = await res.json();
      if (res.ok) {
        const filtered = (data.barang || []).filter(
          (barang) => barang.status_titip === "DONATABLE"
        );
        setHasilPencarian(filtered);
      }
    } catch (err) {
      console.error("Gagal mencari barang:", err);
    }
  };

  const handleDelete = async (id_request) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    const res = await fetch("/api/requestdonasi", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_request }),
    });

    if (res.ok) {
      setRequestDonasiList((prev) =>
        prev.filter((item) => item.id_request !== id_request)
      );
      alert("Data berhasil dihapus");
    } else {
      alert("Gagal menghapus data");
    }
  };

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

  const [mode, setMode] = useState(null);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-indigo-700">
        Data Request Donasi
      </h1>

      <input
        type="text"
        placeholder="Cari berdasarkan deskripsi atau status"
        className="text-base mb-4 px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="overflow-x-auto flex flex-col">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              {[
                "Action",
                "ID Request",
                "Tanggal Request",
                "Deskripsi",
                "Status",
                "ID Organisasi",
              ].map((col) => (
                <th key={col} className="px-5 py-3 text-white text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {requestDonasiList.map((item) => (
              <tr key={item.id_request} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-right font-medium">
                  <div className="relative dropdown-action flex justify-center items-center">
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === item.id_request
                            ? null
                            : item.id_request
                        )
                      }
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <EllipsisVertical />
                    </button>
                    {activeDropdown === item.id_request && (
                      <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                        {(item.status_request === "APPROVED" ||
                          item.status_request === "PENDING") && (
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            onClick={() => handleEdit(item)}
                          >
                            Atur Donasi
                          </button>
                        )}
                        <button
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                          onClick={() => handleDelete(item.id_request)}
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.id_request}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(item.tanggal_request)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.deskripsi}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.status_request}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.id_organisasi}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showSidebar && editData && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black opacity-20"
            onClick={() => {
              setShowSidebar(false);
              setMode(null);
            }}
          />
          <div className="fixed inset-y-0 right-0 z-50 bg-white w-3/5 h-full shadow-xl transition-transform duration-300">
            <div className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
              <h2 className="text-lg font-semibold">Atur Request Donasi</h2>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-6 p-6">
              <div>
                <label className="block mb-2 font-semibold text-sm capitalize">
                  Tanggal Request
                </label>
                <DatePicker
                  selected={
                    editData.tanggal_request
                      ? new Date(editData.tanggal_request)
                      : null
                  }
                  onChange={(date) =>
                    setEditData((prev) => ({
                      ...prev,
                      tanggal_request: date.toISOString().split("T")[0],
                    }))
                  }
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Pilih tanggal"
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-sm capitalize">
                  Deskripsi
                </label>
                <input
                  name="deskripsi"
                  onChange={handleChange}
                  value={editData.deskripsi || ""}
                  disabled={mode === "reject"}
                  className="w-full border px-3 py-2 rounded bg-white"
                  placeholder="Masukkan deskripsi"
                />
              </div>

              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("reject");
                    setEditData((prev) => ({
                      ...prev,
                      status_request: "REJECTED",
                    }));
                  }}
                  className={`w-full px-4 py-2 border rounded-full transition-colors duration-200 ${
                    mode === "reject"
                      ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                      : "text-red-600 border-red-600 hover:bg-red-100"
                  }`}
                >
                  Tolak Donasi
                </button>

                <button
                  type="button"
                  onClick={() => setMode("atur_barang")}
                  className="w-full px-4 py-2 text-white rounded-full bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]"
                >
                  Atur Barang Donasi
                </button>
              </div>
              {mode === "atur_barang" && (
                <>
                  {/* Input Search + Result */}
                  <input
                    type="text"
                    placeholder="Cari Barang berdasarkan nama/kode"
                    value={searchBarang}
                    onChange={(e) => setSearchBarang(e.target.value)}
                    className="w-full px-4 py-2 border text-black-600 border-blue-600 rounded-full hover:bg-red-50"
                  />

                  {hasilPencarian.length > 0 && (
                    <ul className="border rounded mt-2 max-h-48 overflow-y-auto">
                      {hasilPencarian.map((barang) => (
                        <li
                          key={barang.id_barang}
                          onClick={() => {
                            // Cek apakah barang sudah dipilih
                            const alreadySelected = barangDonasiList.some(
                              (b) => b.id_barang === barang.id_barang
                            );
                            if (alreadySelected) return;

                            // Maksimal 3 barang
                            if (barangDonasiList.length >= 3) {
                              alert("Maksimal 3 barang bisa dipilih");
                              return;
                            }

                            setBarangDonasiList((prev) => [...prev, barang]);
                            setSearchBarang("");
                            setHasilPencarian([]);
                          }}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {barang.nama_barang} - {barang.kode_produk}
                        </li>
                      ))}
                    </ul>
                  )}

                  {barangDonasiList.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2 text-sm">
                        Barang yang Dipilih:
                      </h3>
                      <ul className="space-y-2">
                        {barangDonasiList.map((barang, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between items-center border p-2 rounded"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {barang.nama_barang}
                              </p>
                              <p className="text-xs text-gray-500">
                                {barang.kode_produk}
                              </p>
                              <p className="text-xs text-gray-500">
                                {barang.kategori_barang?.join(", ")}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setBarangDonasiList(
                                  barangDonasiList.filter(
                                    (b) => b.id_barang !== barang.id_barang
                                  )
                                )
                              }
                              className="text-red-500 text-xs hover:underline"
                            >
                              Hapus
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSidebar(false);
                    setMode(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
