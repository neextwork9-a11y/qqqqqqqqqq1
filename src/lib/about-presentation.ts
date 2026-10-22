import managementOne from "@/assets/lifeos-management-1.jpg";
import managementTwo from "@/assets/lifeos-management-2.jpg";
import expertOne from "@/assets/lifeos-experts-1.jpg";
import expertTwo from "@/assets/lifeos-experts-2.jpg";
import expertThree from "@/assets/lifeos-experts-3.jpg";
import finance from "@/assets/lifeos-collaboration-1.jpg";
import services from "@/assets/lifeos-collaboration-2.jpg";
import certOne from "@/assets/lifeos-cert-1.jpg";
import certTwo from "@/assets/lifeos-cert-2.jpg";
import certThree from "@/assets/lifeos-cert-3.jpg";
import certFour from "@/assets/lifeos-cert-4.jpg";
import certFive from "@/assets/lifeos-cert-5.jpg";

// Same markup as the original CEO row so new profiles keep the old element types and image size.
const leader = (name: string, role: string, image: string, paragraphs: string[]) =>
  `<hr class="hr-short"/><div class="row" style="margin-top: 40px"><div class="col-lg-6 col-md-6 col-sm-6 animated fadeInRight"><img alt="${name}" class="img-responsive lifeos-portrait" src="${image}" style="border: 1px solid var(--border)"/></div><div class="col-lg-6 col-md-6 col-sm-6 animated fadeInLeft"><h5>${name}</h5><h6>${role}</h6><br/>${paragraphs.map(p => `<p>${p}</p>`).join("")}</div></div>`;

export function aboutPresentation(page: string, original: string): string {
  if (page === "management") {
    const additions =
      leader("SAMIA RAHMAN", "Chief Operating Officer (COO)", managementOne, [
        "Samia oversees daily operations at Life OS, keeping every team aligned on one goal: services that are simple, reliable and easy to use.",
        "She leads service quality, customer experience and team coordination, so that each of the 26 essential services works smoothly for every user.",
      ]) +
      leader("FARHAN AHMED", "Chief Technology & Business Development Officer", managementTwo, [
        "Farhan drives the technology roadmap behind one Life ID and one app, and builds the partnerships that bring new services onto the platform.",
        "His focus is secure, scalable technology and sustainable growth that creates lasting value for users and partners alike.",
      ]);
    return original.replace(/<hr class="hr-short"\/>\s*<hr class="hr-short"\/>/, additions + '<hr class="hr-short"/>');
  }
  if (page === "scientists") {
    const images = [expertOne, expertTwo, expertThree];
    let i = 0;
    return original.replace(/src="lifeos-media:\/\/people\/0\d"/g, () => `src="${images[i++]}"`).replace(/class="img-responsive"/g, 'class="img-responsive lifeos-portrait"').replace("<p>PhD (Universiti Malaya)\n</p>", "<p>Specialization: Artificial intelligence &amp; data security</p>");
  }
  if (page === "business-collaboration") {
    return original.replace('src="lifeos-media://events/21"', `src="${finance}"`).replace('src="lifeos-media://events/22"', `src="${services}"`);
  }
  if (page === "business-opportunity") {
    return original.replace(/\u00a0/g, "").replace(/Work from home or caf\u00e9\u2026 wherever!/, "Work from home, a caf\u00e9 or wherever suits you").replace(/You earn what you\u2019re worth/, "Earn according to your effort");
  }
  if (page === "halal-certificates") {
    const certs = [certOne, certTwo, certThree, certFour, certFive];
    return original.replace(/lifeos-media:\/\/recognition\/3([3-7])/g, (_, n) => certs[Number(n) - 3] ?? "").replace(/class="img-fluid"/g, 'class="img-fluid lifeos-certificate"');
  }
  return original;
}
