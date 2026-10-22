import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Msg, Page, useMember } from "@/components/member-kit";
import { memberApi } from "@/lib/member-api";

export const Route = createFileRoute("/member/profile")({
  head: () => ({ meta: [{ title: "My Profile — Life OS Member" }, { name: "description", content: "View and edit your Life OS profile." }, { property: "og:title", content: "My Profile — Life OS Member" }, { property: "og:description", content: "View and edit your Life OS profile." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Profile,
});

const TOP: [string, string][] = [
  ["name", "Full Name"], ["father_name", "Father's Name"], ["mother_name", "Mother's Name"],
  ["nominee_name", "Nominee's Name"], ["nominee_relation", "Relation With Nominee"], ["dob", "Date of Birth"],
  ["nid", "Acc. NID No"], ["blood_group", "Blood Group"],
];
const BOTTOM: [string, string][] = [
  ["post_code", "Post Code"], ["ward_no", "Ward No"], ["union_name", "Union / Municipality"],
  ["upazila", "Sub-District Name"], ["district", "District Name"],
];
const inp: React.CSSProperties = { width: 293, height: 35, border: "1px solid #AAA", background: "#FAFAFA", padding: "0 10px", fontSize: 16, boxSizing: "border-box" };
const lbl: React.CSSProperties = { fontSize: 16, height: 42, width: "45%" };

function Profile() {
  const q = useMember<Record<string, string | null>>("profile", "/profile");
  const me = useMember<{ email: string | null; phone: string }>("me", "/me").data;
  const [f, setF] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  useEffect(() => {
    if (q.data) setF(Object.fromEntries(Object.entries(q.data).map(([k, v]) => [k, v ?? ""])));
  }, [q.data]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) return setMsg({ ok: false, t: "Photo must be under 1 MB." });
    const r = new FileReader();
    r.onload = () => setPhoto(String(r.result));
    r.readAsDataURL(file);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await memberApi("/profile", { body: photo ? { ...f, photo } : f });
      setMsg({ ok: true, t: "Profile updated successfully." });
      q.refetch();
    } catch (err) {
      setMsg({ ok: false, t: (err as Error).message });
    }
  };

  const field = ([k, l]: [string, string]) => (
    <tr key={k}>
      <td style={lbl}>{l}</td><td style={{ width: "5%", fontSize: 16 }}>:</td>
      <td><input style={inp} type="text" placeholder={k === "dob" ? "YYYY-MM-DD" : undefined} value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></td>
    </tr>
  );
  const img = photo || f["photo"] || "/member-kit/images/avatar.png";

  return (
    <Page title="My Profile">
      <form onSubmit={save} className="lifeos-profile">
        <Msg ok={msg?.ok} text={msg?.t ?? null} />
        <div className="lifeos-profile-grid">
          <table border={0} cellSpacing={0} cellPadding={0} style={{ width: "100%" }}>
            <tbody>
              {TOP.map(field)}
              <tr><td style={lbl}>Email Address</td><td style={{ fontSize: 16 }}>:</td><td><input style={inp} readOnly value={me?.email ?? ""} /></td></tr>
              <tr><td style={lbl}>Mobile Number</td><td style={{ fontSize: 16 }}>:</td><td><input style={inp} readOnly value={me?.phone ?? ""} /></td></tr>
              {field(["phone_alt", "Alternate Number"])}
              <tr><td style={lbl}>Address</td><td style={{ fontSize: 16 }}>:</td>
                <td><textarea style={{ ...inp, height: 97, width: 287, padding: 10 }} value={f["address_current"] ?? ""} onChange={(e) => setF({ ...f, address_current: e.target.value })} /></td></tr>
              {BOTTOM.map(field)}
            </tbody>
          </table>
          <table border={0} cellSpacing={0} cellPadding={0} style={{ width: "100%" }}>
            <tbody>
              <tr><td style={lbl}>Passport Photo</td><td style={{ width: "5%", fontSize: 16 }}>:</td>
                <td><img src={img} alt="Passport" style={{ width: 322, maxWidth: "100%", height: 204, objectFit: "cover", border: "1px solid #ddd" }} onError={(e) => { (e.target as HTMLImageElement).style.visibility = "hidden"; }} /></td></tr>
              <tr><td style={lbl}>New Photo</td><td style={{ fontSize: 16 }}>:</td>
                <td><input type="file" accept="image/*" onChange={onFile} style={{ border: 0, fontSize: 16, background: "transparent", padding: 0 }} /></td></tr>
              <tr className="lifeos-profile-spacer"><td style={{ height: 160 }} /><td /><td /></tr>
              <tr><td /><td /><td><input type="submit" value="Save" style={{ fontSize: 16, border: "1px solid #AAA", background: "#fff", padding: "2px 8px" }} /></td></tr>
            </tbody>
          </table>
        </div>
      </form>
    </Page>
  );
}
