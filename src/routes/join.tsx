import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { memberApi, memberToken } from "@/lib/member-api";
import { Button } from "@/components/ui/button";
import { BLOOD_GROUPS, DISTRICTS, type JoinTeam } from "@/lib/join-fields";

type Search = { ref?: string | undefined; team?: JoinTeam | undefined };
type Sponsor = { name: string; life_id: string; placement_life_id: string; placement_side: JoinTeam };

export const Route = createFileRoute("/join")({
  validateSearch: (s: Record<string, unknown>): Search => ({ ref: typeof s["ref"] === "string" ? s["ref"] : undefined, team: s["team"] === "L" || s["team"] === "R" ? s["team"] : undefined }),
  head: () => ({
    meta: [
      { title: "Join Life OS — Member Registration" },
      { name: "description", content: "Register a new Life OS member account through your sponsor's referral link." },
      { property: "og:title", content: "Join Life OS — Member Registration" },
      { property: "og:description", content: "Register a new Life OS member account through your sponsor's referral link." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Join,
});

function Join() {
  const { ref, team: linkTeam } = Route.useSearch();
  const navigate = useNavigate();
  const [team, setTeam] = useState<JoinTeam | undefined>(linkTeam);
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [refErr, setRefErr] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoErr, setPhotoErr] = useState("");
  useEffect(() => { setTeam(linkTeam); }, [linkTeam, ref]);
  useEffect(() => {
    let active = true;
    setSponsor(null); setRefErr("");
    if (!ref) { setRefErr("A sponsor referral link is required. Please request a Left or Right Team link from your sponsor."); return; }
    memberApi<Sponsor>(`/sponsor?code=${encodeURIComponent(ref)}${team ? `&team=${team}` : ""}`)
      .then(s => { if (active) setSponsor(s); })
      .catch(e => { if (active) setRefErr(e.message === "Failed to fetch" ? "Unable to verify this referral link. Please try again when the server is available." : e.message); });
    return () => { active = false; };
  }, [ref, team]);

  async function pickPhoto(file?: File) {
    setPhoto(null); setPhotoErr("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) { setPhotoErr("Choose a JPG, PNG or WebP photo no larger than 2 MB."); return; }
    try {
      const value = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid photo"));
        reader.onerror = () => reject(new Error("Unable to read photo"));
        reader.readAsDataURL(file);
      });
      setPhoto(value);
    } catch { setPhotoErr("Unable to read photo. Please choose it again."); }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!sponsor || !team || photoErr) return;
    if (fd.get("password") !== fd.get("confirm")) { setErr("Passwords do not match."); return; }
    setErr(""); setBusy(true);
    try {
      const r = await memberApi<{ token: string; life_id: string }>("/register", { body: {
        name: fd.get("name"), phone: fd.get("phone"), email: fd.get("email"),
        nid_number: fd.get("nid_number"), blood_group: fd.get("blood_group"), district: fd.get("district"),
        post_code: fd.get("post_code"), address_current: fd.get("address_current"), photo_base64: photo,
        username: fd.get("username"), password: fd.get("password"), confirm_password: fd.get("confirm"),
        referral_code: ref, team, accepted_terms: fd.get("terms") ? 1 : 0,
      } });
      memberToken.set(r.token);
      await navigate({ to: "/member" });
    } catch (x) { setErr(x instanceof Error ? (x.message === "Failed to fetch" ? "Unable to connect to the registration server. Please try again." : x.message) : "Registration failed."); }
    finally { setBusy(false); }
  }
  function row(label: string, id: string, control: ReactNode, required = false) {
    return <div className="join-field" key={id}><label htmlFor={id}>{label}{required && <span className="join-required"> *</span>}</label><span className="join-colon">:</span><div className="join-control">{control}</div></div>;
  }
  return <main className="team-join-page"><section className="team-join-content">
    <h1>Life OS — Member Registration</h1>
    {refErr && <p className="join-error" role="alert">{refErr}</p>}
    {ref && !refErr && !sponsor && <p role="status">Verifying sponsor and placement…</p>}
    {sponsor && <p className="join-sponsor">{sponsor.name} · {sponsor.life_id}</p>}
    <form className="team-join-form" onSubmit={submit}>
      {row("Full Name", "name", <input id="name" name="name" required maxLength={100} autoComplete="name" />, true)}
      {row("Cell Number", "phone", <input id="phone" name="phone" type="tel" required pattern="01[3-9][0-9]{8}" autoComplete="tel" />, true)}
      {row("Email Address", "email", <input id="email" name="email" type="email" required maxLength={120} autoComplete="email" />, true)}
      {row("NID/PP No/DL. No.", "nid_number", <input id="nid_number" name="nid_number" maxLength={30} />)}
      {row("Blood Group", "blood_group", <select id="blood_group" name="blood_group" required defaultValue=""><option value="" disabled>Select</option>{BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}</select>, true)}
      {row("District Name", "district", <select id="district" name="district" required defaultValue=""><option value="" disabled>Select</option>{DISTRICTS.map(d => <option key={d}>{d}</option>)}</select>, true)}
      {row("Post Code", "post_code", <input id="post_code" name="post_code" required maxLength={12} autoComplete="postal-code" />, true)}
      {row("Address", "address_current", <textarea id="address_current" name="address_current" required maxLength={2000} rows={4} autoComplete="street-address" />, true)}
      {row("Profile Passport Size Photo", "photo", <><input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => void pickPhoto(e.currentTarget.files?.[0])} />{photo && <img className="join-photo" src={photo} alt="Selected profile photo" />}{photoErr && <p className="join-error" role="alert">{photoErr}</p>}</>)}
      {row("Sponsor/Referral ID", "sponsor", <input id="sponsor" value={sponsor?.life_id ?? ref ?? ""} readOnly />, true)}
      {row("Placement UserID", "placement", <input id="placement" value={sponsor?.placement_life_id ?? ""} readOnly />, true)}
      {row("Choose Option", "team-choice", <fieldset id="team-choice" className="join-team" aria-label="Choose team"><label><input type="radio" name="team" value="L" checked={team === "L"} disabled={!!linkTeam} required onChange={() => setTeam("L")} /> Left Team</label><label><input type="radio" name="team" value="R" checked={team === "R"} disabled={!!linkTeam} required onChange={() => setTeam("R")} /> Right Team</label></fieldset>, true)}
      {row("Enter Username", "username", <input id="username" name="username" required minLength={4} maxLength={40} pattern="[A-Za-z][A-Za-z0-9_]{3,39}" autoComplete="username" />, true)}
      {row("Enter Password", "password", <input id="password" name="password" type="password" required minLength={4} maxLength={72} autoComplete="new-password" />, true)}
      {row("Confirm Password", "confirm", <input id="confirm" name="confirm" type="password" required minLength={4} maxLength={72} autoComplete="new-password" />, true)}
      {row("Terms & Conditions", "terms", <label className="join-terms"><input id="terms" name="terms" type="checkbox" required /> I Agree With Company TOS</label>)}
      {row("", "submit", <><Button id="submit" variant="reference" className="join-submit" type="submit" disabled={busy || !sponsor || !team || !!photoErr}>{busy ? "Submitting…" : "Submit"}</Button>{err && <p className="join-error" role="alert">{err}</p>}</>)}
    </form>
  </section></main>;
}
