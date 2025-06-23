import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export default async function PenitipDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT verification error:", err);
    redirect("/login");
  }

  if (decoded.role !== "penitip") redirect("/login");

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorRes = await res.json();
    console.error("Fetch error:", errorRes);
    redirect("/login");
  }

  const json = await res.json();
  const user = json.user;

  if (!user) {
    console.error("User data is missing:", json);
    redirect("/login");
  }

  return (
    <h1>
      Welcome {user.nama}, you are a {user.role}
    </h1>
  );
}
