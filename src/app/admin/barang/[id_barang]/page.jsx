"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReuseButton from "@/components/ReuseButton/ReuseButton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DetailBarangAdminPage() {
  const { id_barang } = useParams();
  const router = useRouter();

  const [barang, setBarang] = useState(null);
  const [previewImg, setPreviewImg] = useState("");
  const [uniqueImages, setUniqueImages] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [formData, setFormData] = useState({});
  const [previewImages, setPreviewImages] = useState([]);

  const fetchBarang = async () => {
    try {
      const res = await fetch(`/api/barang/${id_barang}`);
      const data = await res.json();
      setBarang(data.barang);

      if (data.barang.gambar_barang?.length > 0) {
        setOldImages(data.barang.gambar_barang);
      }

      if (data.barang && data.barang.gambar_barang.length > 0) {
        setPreviewImg(data.barang.gambar_barang[0].src_img);
        const uniqueImgs = Array.from(
          new Set(data.barang.gambar_barang.map((item) => item.src_img))
        ).map((src_img) =>
          data.barang.gambar_barang.find((item) => item.src_img === src_img)
        );
        setUniqueImages(uniqueImgs);
      }
    } catch (err) {
      console.error("Gagal memuat barang:", err);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, [id_barang]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const totalImages = oldImages.length + (formData.gambar?.length || 0);
    if (totalImages < 2) {
      alert("Minimal harus ada 2 gambar barang.");
      return;
    }

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    const form = new FormData();
    form.append("nama_barang", formData.nama_barang);
    form.append("deskripsi_barang", formData.deskripsi_barang);
    form.append("harga_barang", formData.harga_barang);
    form.append("berat_barang", formData.berat_barang);
    form.append("tanggal_garansi", formData.tanggal_garansi);
    form.append("tanggal_masuk", formData.tanggal_masuk || "");
    form.append("tanggal_keluar", formData.tanggal_keluar || "");

    form.append("status_titip", "AVAILABLE");

    const gambarLamaIds = oldImages.map((img) => img.id_gambar);
    form.append("gambar_lama", JSON.stringify(gambarLamaIds));

    if (formData.gambar instanceof FileList) {
      Array.from(formData.gambar).forEach((file) => {
        form.append("gambar", file);
      });
    }

    const res = await fetch(`/api/barang/${id_barang}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (res.ok) {
      alert("Barang berhasil diupdate");
      setShowSidebar(false);
      router.refresh();
      fetchBarang();
    } else {
      alert(data.error || "Gagal mengupdate barang");
    }
  };

  useEffect(() => {
    return () => {
      previewImages.forEach((src) => URL.revokeObjectURL(src));
    };
  }, [previewImages]);

  const handleKonfirmasiPengambilan = async (id_barang) => {
    try {
      const res = await fetch(`/api/barang/by-gudang/picked/${id_barang}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status_titip: "PICKED_UP",
        }),
      });

      if (!res.ok) throw new Error("Gagal mengkonfirmasi pengambilan");

      alert("Status diperbarui ke PICKED_UP.");

      setBarang((prev) => ({
        ...prev,
        status_titip: "PICKED_UP",
      }));
    } catch (error) {
      console.error("Error konfirmasi pengambilan:", error);
      alert("Terjadi kesalahan saat mengkonfirmasi.");
    }
  };

  const handleRemoveOldImage = (index) => {
    setOldImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (!barang) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Kembali
      </button>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <img
            src={previewImg || "/images/default-image.jpg"}
            alt={barang.nama_barang}
            className="w-full h-[400px] object-cover rounded-xl mb-4"
          />

          <div className="flex gap-2">
            {uniqueImages.map((gambar, index) => (
              <img
                key={index}
                src={gambar.src_img}
                onClick={() => setPreviewImg(gambar.src_img)}
                className={`w-20 h-20 object-cover rounded cursor-pointer ${
                  previewImg === gambar.src_img ? "ring-2 ring-indigo-600" : ""
                } `}
              />
            ))}
          </div>

          <div className="mt-4 flex justify-start gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFormData(barang);
                setShowSidebar(true);
              }}
              className="w-28 rounded-full bg-gradient-to-r from-blue-800 to-blue-400 text-white font-semibold py-2 hover:opacity-90 transition"
            >
              Edit
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
                  router.push("/admin/barang");
                } else {
                  alert(data.error || "Gagal menghapus barang");
                }
              }}
              className="w-28 rounded-full bg-gradient-to-r from-red-700 to-red-400 text-white font-semibold py-2 hover:opacity-90 transition"
            >
              Hapus
            </button>

            <button
              onClick={async () => {
                try {
                  const token = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("token="))
                    ?.split("=")[1];

                  const patchRes = await fetch(`/api/barang/${id_barang}`, {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  const patchData = await patchRes.json();

                  if (patchRes.ok) {
                    toast.success(
                      patchData.message || "Status berhasil diubah ke DONATABLE"
                    );
                  } else {
                    toast.error(
                      patchData.error ||
                        patchData.message ||
                        "Gagal mengubah status"
                    );
                  }
                } catch (error) {
                  console.error("Error:", error);
                  toast.error("Terjadi kesalahan saat menghubungi server");
                }
              }}
              className="w-28 rounded-full bg-gradient-to-r from-red-700 to-red-400 text-white font-semibold py-2 hover:opacity-90 transition"
            >
              Set Donatable
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{barang.nama_barang}</h1>
          <p className="text-lg font-semibold text-indigo-700 mb-4">
            Rp{parseInt(barang.harga_barang).toLocaleString("id-ID")}
          </p>

          <div className="grid gap-2 text-sm">
            <p>
              <strong>Kode Produk:</strong> {barang.kode_produk}
            </p>
            <p>
              <strong>Status Titip:</strong> {barang.status_titip}
            </p>
            <p>
              <strong>Garansi:</strong>{" "}
              {barang.tanggal_garansi
                ? formatDate(barang.tanggal_garansi)
                : "-"}
            </p>
            <p>
              <strong>Tanggal Masuk:</strong> {formatDate(barang.tanggal_masuk)}
            </p>
            <p>
              <strong>Tanggal Keluar:</strong>{" "}
              {barang.tanggal_keluar ? formatDate(barang.tanggal_keluar) : "-"}
            </p>
            <p>
              <strong>Penitip:</strong>{" "}
              {barang.id_penitip
                ? `${barang.id_penitip} - ${barang.penitip_name}`
                : barang.penitip_name}
            </p>
            <p>
              <strong>Deskripsi:</strong>
            </p>
            <div className="text-sm whitespace-pre-line leading-relaxed">
              {barang.deskripsi_barang || "Tidak ada deskripsi."}
            </div>

            {["READY_PICK_UP"].includes(
              barang?.status_titip?.toUpperCase()
            ) && (
              <ReuseButton className="mt-4">
                <button
                  className="p-2 text-lg font-medium"
                  onClick={() => handleKonfirmasiPengambilan(barang.id_barang)}
                >
                  Barang Telah Diambil Penitip
                </button>
              </ReuseButton>
            )}
          </div>
        </div>
      </div>
      {showSidebar && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black opacity-20"
            onClick={() => setShowSidebar(false)}
          />

          <div
            className="fixed inset-y-0 right-0 z-50 bg-white w-3/5 h-full shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 font-semibold text-white text-sm bg-[radial-gradient(ellipse_130.87%392.78%_at_121.67%_0.00%,#26C2FF_0%,_#220593_90%)]">
              <h2 className="text-lg">Edit Barang</h2>
            </div>

            <form className="flex flex-col gap-6 p-6" onSubmit={handleUpdate}>
              <label
                htmlFor="gambar"
                className="text-sm font-bold text-black-700"
              >
                Foto Barang :
              </label>

              <div className="flex flex-wrap gap-2 mt-2">
                {oldImages.map((img, i) => (
                  <div key={`old-${i}`} className="relative w-20 h-20">
                    <img
                      src={img.src_img}
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOldImage(i)}
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-tr rounded-bl"
                    >
                      X
                    </button>
                  </div>
                ))}

                {previewImages.map((src, i) => (
                  <div key={`preview-${i}`} className="relative w-20 h-20">
                    <img
                      src={src}
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePreview(i)}
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-tr rounded-bl"
                    >
                      X
                    </button>
                  </div>
                ))}

                <label className="w-20 h-20 border border-dashed rounded flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100">
                  +
                  <input
                    type="file"
                    name="gambar"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      const previews = Array.from(files).map((file) =>
                        URL.createObjectURL(file)
                      );

                      const dt = new DataTransfer();
                      Array.from(files).forEach((file) => dt.items.add(file));

                      setFormData((prev) => ({ ...prev, gambar: dt.files }));
                      setPreviewImages(previews);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <label
                htmlFor="nama_barang"
                className="text-sm font-bold text-black-700"
              >
                Nama Barang :
              </label>
              <input
                type="text"
                name="nama_barang"
                value={formData.nama_barang || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nama_barang: e.target.value })
                }
                className="border px-3 py-2 rounded"
                placeholder="Nama Barang"
              />

              <label
                htmlFor="harga_barang"
                className="text-sm font-bold text-black-700"
              >
                Harga Barang :
              </label>
              <input
                type="number"
                name="harga_barang"
                value={formData.harga_barang || ""}
                onChange={(e) =>
                  setFormData({ ...formData, harga_barang: e.target.value })
                }
                className="border px-3 py-2 rounded"
                placeholder="Harga Barang"
              />

              <label
                htmlFor="berat_barang"
                className="text-sm font-bold text-black-700"
              >
                Berat Barang :
              </label>
              <input
                type="number"
                name="berat_barang"
                value={formData.berat_barang || ""}
                onChange={(e) =>
                  setFormData({ ...formData, berat_barang: e.target.value })
                }
                className="border px-3 py-2 rounded"
                placeholder="Berat (gram)"
              />

              {barang?.kategori_barang?.includes("Elektronik") && (
                <>
                  <label
                    htmlFor="tanggal_garansi"
                    className="text-sm font-bold text-black-700"
                  >
                    Tanggal Garansi Barang :
                  </label>
                  <input
                    type="date"
                    name="tanggal_garansi"
                    value={formData.tanggal_garansi?.split("T")[0] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggal_garansi: e.target.value,
                      })
                    }
                    className="border px-3 py-2 rounded"
                  />
                </>
              )}

              <label
                htmlFor="tanggal_masuk"
                className="text-sm font-bold text-black-700"
              >
                Tanggal Masuk :
              </label>
              <input
                type="date"
                name="tanggal_masuk"
                value={formData.tanggal_masuk?.split("T")[0] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal_masuk: e.target.value })
                }
                className="border px-3 py-2 rounded"
              />

              <label
                htmlFor="tanggal_keluar"
                className="text-sm font-bold text-black-700"
              >
                Tanggal Keluar :
              </label>
              <input
                type="date"
                name="tanggal_keluar"
                value={formData.tanggal_keluar?.split("T")[0] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal_keluar: e.target.value })
                }
                className="border px-3 py-2 rounded"
              />

              <label
                htmlFor="deskripsi_barang"
                className="text-sm font-bold text-black-700"
              >
                Deskripsi :
              </label>
              <textarea
                name="deskripsi_barang"
                value={formData.deskripsi_barang || ""}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi_barang: e.target.value })
                }
                className="border px-3 py-2 rounded"
                placeholder="Deskripsi Barang"
              />

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
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="bg-white text-gray-800 shadow-md rounded-lg px-4 py-3"
        bodyClassName="text-sm font-medium bg-gray-800"
      />
    </div>
  );
}
