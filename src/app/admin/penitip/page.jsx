"use client";

import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import WithRole from "@/components/WithRole/WithRole";

export default function AdminPenitipPage() {
  const [penitipList, setPenitipList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [topSeller, setTopSeller] = useState(null);

  const defaultFormData = {
    nama: "",
    email: "",
    no_ktp: "",
    no_telepon: "",
    password: "",
    foto_ktp: null,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [previewKTP, setPreviewKTP] = useState(null);

  // useEffect(() => {
  //     const fetchUser = async () => {
  //         try {
  //             const res = await fetch('/api/auth/me');
  //             const data = await res.json();

  //             if (res.ok && data.success) {
  //                 setUser(data.user);
  //             } else {
  //                 setUser(null);
  //             }
  //         } catch (err) {
  //             console.error('Gagal mengambil user:', err);
  //             setUser(null);
  //         } finally {
  //             setLoadingUser(false);
  //         }
  //     };
  //     fetchUser();
  // }, []);

  useEffect(() => {
    const fetchPenitip = async () => {
      try {
        const res = await fetch(
          `/api/penitip?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        if (res.ok) {
          setPenitipList(data.penitip);
        } else {
          setError(data.error || "Gagal mengambil data penitip");
        }
      } catch (err) {
        console.error("Error fetching penitip:", err);
        setError("Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchPenitip();
  }, [searchQuery]);

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

  const handleDelete = async (id_penitip) => {
    const confirm = window.confirm(
      "Apakah Anda yakin ingin menghapus data ini?"
    );
    if (!confirm) return;

    const res = await fetch("/api/penitip", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_penitip }),
    });

    if (res.ok) {
      setPenitipList((prev) => prev.filter((p) => p.id_penitip !== id_penitip));
      alert("Data berhasil dihapus");
    } else {
      alert("Gagal menghapus data");
    }
  };

  const handleEdit = (penitip) => {
    setFormData({
      ...penitip,
      password: "",
      foto_ktp: penitip.foto_ktp || null,
    });
    setIsEditMode(true);
    setShowSidebar(true);
  };

  const handleAddNew = () => {
    setFormData(defaultFormData);
    setPreviewKTP(null);
    setIsEditMode(false);
    setShowSidebar(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    const payload = {
      id_penitip: formData.id_penitip,
      nama: formData.nama,
      email: formData.email,
      no_ktp: formData.no_ktp,
      no_telepon: formData.no_telepon,
      badge_level: formData.badge_level,
      is_verified: formData.is_verified,
      password: formData.password,
    };

    const res = await fetch("/api/penitip", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      setPenitipList((prev) =>
        prev.map((p) =>
          p.id_penitip === formData.id_penitip ? data.updatedPenitip : p
        )
      );
      setShowSidebar(false);
      alert("Data berhasil diperbarui");
    } else {
      alert(data.error || "Gagal memperbarui data");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const getTopSeller = async () => {
      const res = await fetch("/api/top-seller/nama");
      const data = await res.json();
      if (res.ok && data.top_seller) {
        setTopSeller(data.top_seller);
      }
    };
    getTopSeller();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    const form = new FormData();
    form.append("nama", formData.nama);
    form.append("email", formData.email);
    form.append("no_ktp", formData.no_ktp);
    form.append("no_telepon", formData.no_telepon);
    form.append("password", formData.password);
    form.append("foto_ktp", formData.foto_ktp);

    const res = await fetch("/api/penitip", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await res.json();
    if (res.ok) {
      setPenitipList((prev) => [...prev, data.penitipBaru]);
      setShowSidebar(false);
      setFormData({
        nama: "",
        email: "",
        no_ktp: "",
        no_telepon: "",
        password: "",
        foto_ktp: null,
      });
      alert("Penitip berhasil ditambahkan");
    } else {
      alert(data.error || "Gagal menambahkan penitip");
    }
  };

  const handleGenerateTopSeller = async () => {
    try {
      const res = await fetch("/api/top-seller/update", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        alert(
          `✅ Top Seller berhasil diperbarui!\n\n📌 ${
            data.top_seller?.nama || "Tidak ditemukan"
          } (${data.top_seller?.email})`
        );
        setTopSeller(data.top_seller || null);

        // refresh data
        const refreshed = await fetch(
          `/api/penitip?q=${encodeURIComponent(searchQuery)}`
        );
        const refreshedData = await refreshed.json();
        if (refreshed.ok) {
          setPenitipList(refreshedData.penitip);
        }
      } else {
        alert(data.error || "Gagal update Top Seller.");
      }
    } catch (err) {
      console.error("Error memanggil Top Seller API:", err);
      alert("Terjadi kesalahan saat mengupdate Top Seller.");
    }
  };

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

  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 relative">
      <WithRole allowed={["CS", "Superuser"]}>
        <h1 className="text-4xl font-[Montage-Demo] mb-4">Barang Titipan</h1>
        {topSeller && (
          <div className="bg-green-50 border border-green-300 text-green-700 p-4 rounded mb-4">
            <strong>🏆 Top Seller Bulan Ini:</strong>
            <br />
            {topSeller.nama} ({topSeller.email})<br />
            Barang Terjual: {topSeller.jml_barang_terjual_bulanan}
          </div>
        )}

        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Cari nama/email..."
            className="px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex gap-2 ml-4">
            <button
              onClick={handleAddNew}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Tambah Penitip
            </button>
            <button
              onClick={handleGenerateTopSeller}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Generate Top Seller
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex flex-col">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                {[
                  "Action",
                  "ID",
                  "Nama",
                  "Email",
                  "KTP",
                  "Telepon",
                  "Badge",
                  "Komisi",
                  "Total Barang",
                ].map((col) => (
                  <th key={col} className="px-5 py-3 text-white text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {penitipList.map((p, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-100 hover:bg-gray-200"
                >
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div
                      className="relative dropdown-action flex justify-center items-center"
                      ref={dropdownRef}
                    >
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === p.id_penitip
                              ? null
                              : p.id_penitip
                          )
                        }
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <EllipsisVertical />
                      </button>

                      {activeDropdown === p.id_penitip && (
                        <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            onClick={() => handleEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                            onClick={() => handleDelete(p.id_penitip)}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {p.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {p.nama}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {p.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {p.no_ktp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    +62{p.no_telepon}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {p.badge_level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatRupiah(p.komisi)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {p.total_barang}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showSidebar && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black opacity-20"
              onClick={() => setShowSidebar(false)}
            />
            <div className="fixed inset-y-0 right-0 z-50 bg-white w-full max-w-md h-full p-6 shadow-xl transition-transform duration-300">
              <h2 className="text-lg font-bold mb-4">
                {isEditMode ? "Edit Penitip" : "Tambah Penitip"}
              </h2>
              <form
                onSubmit={isEditMode ? handleUpdate : handleSubmit}
                className="space-y-4 overflow-y-auto max-h-[90vh]"
                encType="multipart/form-data"
              >
                <input
                  name="nama"
                  onChange={handleChange}
                  value={formData.nama}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Nama"
                />
                <input
                  name="email"
                  onChange={handleChange}
                  value={formData.email}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Email"
                />
                <input
                  name="no_telepon"
                  onChange={handleChange}
                  value={formData.no_telepon}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="No. Telepon"
                />
                <input
                  name="password"
                  type="password"
                  onChange={handleChange}
                  value={formData.password}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Password"
                />

                {/* foto KTP */}
                <label className="font-semibold text-gray-500">Foto KTP</label>
                <label
                  htmlFor="foto_ktp"
                  className="inline-block w-full px-4 py-2 border text-GR rounded cursor-pointer hover:bg-gray-200 transition"
                >
                  Pilih Foto KTP
                </label>
                <input
                  id="foto_ktp"
                  type="file"
                  accept="image/*"
                  name="foto_ktp"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFormData((prev) => ({ ...prev, foto_ktp: file }));

                    if (file) {
                      setPreviewKTP(URL.createObjectURL(file));
                    } else {
                      setPreviewKTP(null);
                    }
                  }}
                  className="hidden"
                />
                {previewKTP && (
                  <img
                    src={previewKTP}
                    alt="Preview KTP"
                    className="w-full max-h-64 object-contain border rounded mt-2"
                  />
                )}

                <input
                  name="no_ktp"
                  onChange={handleChange}
                  value={formData.no_ktp}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="No. KTP"
                />

                {isEditMode && (
                  <>
                    <label className="font-semibold text-gray-500">
                      Status Verifikasi
                    </label>
                    <select
                      name="is_verified"
                      onChange={handleChange}
                      value={formData.is_verified}
                      className="w-full border px-3 py-2 rounded"
                    >
                      <option value={0}>Belum Terverifikasi</option>
                      <option value={1}>Terverifikasi</option>
                    </select>

                    <label className="font-semibold text-gray-500">
                      Badge Level
                    </label>
                    <input
                      value={formData.badge_level}
                      disabled
                      className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSidebar(false)}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </WithRole>
    </div>
  );
}
