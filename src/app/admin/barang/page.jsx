"use client";

import { useEffect, useState } from "react";
import WithRole from "@/components/WithRole/WithRole";
import { useRouter } from "next/navigation";

export default function AdminBarangPage() {
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [penitipOptions, setPenitipOptions] = useState([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    nama_barang: "",
    kode_produk: "",
    harga_barang: "",
    deskripsi_barang: "",
    berat_barang: "",
    status_titip: "AVAILABLE",
    tanggal_garansi: "",
    tanggal_masuk: "",
    id_penitip: "",
    gambar: null,
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    const form = new FormData();
    form.append("nama_barang", formData.nama_barang);
    form.append("harga_barang", formData.harga_barang);
    form.append("deskripsi_barang", formData.deskripsi_barang);
    form.append("berat_barang", formData.berat_barang);
    form.append("tanggal_garansi", formData.tanggal_garansi);
    form.append("id_penitip", formData.id_penitip);

    if (formData.gambar) {
      Array.from(formData.gambar).forEach((file) => {
        form.append("gambar", file);
      });
    }

    const res = await fetch("/api/barang/by-gudang", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await res.json();

    if (res.ok) {
      await fetchBarang();
      setShowSidebar(false);
      setFormData({
        nama_barang: "",
        harga_barang: "",
        deskripsi_barang: "",
        berat_barang: "",
        tanggal_garansi: "",
        tanggal_masuk: "",
        id_penitip: "",
        gambar: null,
      });
      alert("Barang berhasil ditambahkan");
    } else {
      alert(data.error || "Gagal menambahkan barang");
    }
  };

  const fetchBarang = async () => {
    try {
      const res = await fetch("/api/barang/by-gudang");
      const data = await res.json();
      if (res.ok) {
        setBarangList(data.barang);
      } else {
        setError(data.error || "Gagal mengambil data barang");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPenitip = async () => {
      try {
        const res = await fetch("/api/penitip");
        const data = await res.json();
        setPenitipOptions(data.penitip || []);
      } catch (err) {
        console.error("Gagal mengambil data penitip");
      }
    };
    fetchPenitip();
  }, []);

  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const res = await fetch(
          `/api/barang/by-gudang?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        if (res.ok) {
          setBarangList(data.barang);
        } else {
          setError(data.error || "Gagal mengambil data barang");
        }
      } catch (err) {
        console.error("Error fetching barang:", err);
        setError("Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchBarang();
  }, [searchQuery]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <WithRole allowed={["Gudang", "Superuser"]}>
        <h1 className="text-4xl font-[Montage-Demo] mb-4">Data Barang</h1>
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Cari barang..."
            className="px-4 py-2 border border-gray-300 rounded-md w-full max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barangList.map((barang) => (
            <div
              key={barang.id_barang}
              onClick={() => router.push(`/admin/barang/${barang.id_barang}`)}
              className="border p-4 rounded-lg shadow-sm bg-white cursor-pointer hover:shadow-md transition"
            >
              {Array.isArray(barang.gambar_barang) &&
              barang.gambar_barang.length > 0 ? (
                <img
                  src={barang.gambar_barang[0].src_img}
                  alt={barang.nama_barang}
                  className="w-full aspect-square object-cover rounded"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                  Tidak ada gambar
                </div>
              )}
              <h2 className="text-lg font-semibold my-2">
                {barang.nama_barang}
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                <p className="font-medium">Kode</p>
                <p>{barang.kode_produk}</p>

                <p className="font-medium">Harga</p>
                <p>Rp{parseInt(barang.harga_barang).toLocaleString("id-ID")}</p>

                <p className="font-medium">Status Titip</p>
                <p>{barang.status_titip}</p>

                <p className="font-medium">Garansi</p>
                <p>{barang.tanggal_garansi?.split("T")[0]}</p>

                <p className="font-medium">Tanggal Masuk</p>
                <p>{barang.tanggal_masuk?.split("T")[0]}</p>

                <p className="font-medium">Tanggal Keluar</p>
                <p>{barang.tanggal_keluar?.split("T")[0] || "-"}</p>

                <p className="font-medium mb-2">Penitip</p>
                <p className="mb-2">{barang.penitip_name || "-"}</p>
              </div>

              <div className="flex flex-row gap-3 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/barang/${barang.id_barang}`);
                  }}
                  className="w-1/2 rounded-full bg-gradient-to-r from-blue-800 to-blue-400 text-white font-semibold py-2 hover:opacity-90 transition"
                >
                  Lihat Detail
                </button>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const confirmDelete = confirm(
                      "Yakin ingin menghapus barang ini?"
                    );
                    if (!confirmDelete) return;

                    const token = document.cookie
                      .split("; ")
                      .find((row) => row.startsWith("token="))
                      ?.split("=")[1];

                    const res = await fetch("/api/barang", {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ id_barang: barang.id_barang }),
                    });

                    const data = await res.json();
                    if (res.ok) {
                      alert("Barang berhasil dihapus");
                      setBarangList((prev) =>
                        prev.filter(
                          (item) => item.id_barang !== barang.id_barang
                        )
                      );
                    } else {
                      alert(data.error || "Gagal menghapus barang");
                    }
                  }}
                  className="w-1/2 rounded-full bg-gradient-to-r from-red-700 to-red-400 text-white font-semibold py-2 hover:opacity-90 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {showSidebar && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black opacity-20"
              onClick={() => {
                setShowSidebar(false);
              }}
            />

            <div className="fixed inset-y-0 right-0 z-50 bg-white w-3/5 h-full shadow-xl overflow-y-auto max-h-screen transition-transform duration-300">
              <div className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%_392.78%_at_121.67%_0.00%,_#26C2FF_0%,_#220593_90%)]">
                <h2 className="text-lg font-semibold">
                  Tambah Penitipan Barang
                </h2>
              </div>

              <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block mb-1 font-medium text-sm">
                    Gambar Barang
                  </label>
                  <input
                    name="gambar"
                    type="file"
                    multiple
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gambar: e.target.files,
                      }))
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">
                    Nama Barang
                  </label>
                  <input
                    name="nama_barang"
                    onChange={handleChange}
                    value={formData.nama_barang}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Nama Barang"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">
                    Harga Barang
                  </label>
                  <input
                    name="harga_barang"
                    onChange={handleChange}
                    value={formData.harga_barang}
                    type="number"
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Harga Barang"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">
                    Deskripsi Barang
                  </label>
                  <textarea
                    name="deskripsi_barang"
                    onChange={handleChange}
                    value={formData.deskripsi_barang}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Deskripsi lengkap barang"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">
                    Berat Barang (gram)
                  </label>
                  <input
                    type="number"
                    name="berat_barang"
                    onChange={handleChange}
                    value={formData.berat_barang}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Contoh: 1200"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">
                    Tanggal Garansi
                  </label>
                  <input
                    name="tanggal_garansi"
                    onChange={handleChange}
                    value={formData.tanggal_garansi}
                    type="date"
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">
                    Tanggal Masuk
                  </label>
                  <input
                    name="tanggal_masuk"
                    onChange={handleChange}
                    value={formData.tanggal_masuk}
                    type="date"
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">
                    Penitip
                  </label>
                  <select
                    name="id_penitip"
                    onChange={handleChange}
                    value={formData.id_penitip}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">-- Pilih Penitip --</option>
                    {penitipOptions.map((p) => (
                      <option key={p.id_penitip} value={p.id_penitip}>
                        {p.id_penitip} - {p.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSidebar(false)}
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
      </WithRole>
    </div>
  );
}
