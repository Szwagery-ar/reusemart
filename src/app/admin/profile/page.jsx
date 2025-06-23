import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login/admin");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    redirect("/login/admin");
  }

  if (decoded.role !== "pegawai") redirect("/login/admin");

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  const { user } = await res.json();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">
        Profil Pegawai
      </h2>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-600">
          {user.src_img_profile ? (
            <img
              src={user.src_img_profile}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-3xl font-bold text-indigo-800">
              {user.nama?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{user.nama}</h3>
          <p className="text-sm text-gray-600">{user.jabatan}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">ID Pegawai</p>
          <p className="font-medium">{user.id}</p>
        </div>
        <div>
          <p className="text-gray-600">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-gray-600">Nomor Telepon</p>
          <p className="font-medium">+62{user.no_telepon || "-"}</p>
        </div>
        <div>
          <p className="text-gray-600">Tanggal Lahir</p>
          <p className="font-medium">{formatDate(user.tanggal_lahir) || "-"}</p>
        </div>
        <div>
          <p className="text-gray-600">Komisi</p>
          <p className="font-medium">
            Rp{parseInt(user.komisi || 0).toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
}
