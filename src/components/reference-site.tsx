import logo from "@/assets/life-os-logo.png";
import introVideo from "@/assets/lifeos-logo-intro.mp4";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import parse, { attributesToProps, domToReact, Element, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X } from "lucide-react";
import reference from "@/lib/reference-pages.json";
import { collectionLimit, collectionGroups } from "@/lib/content-density";
import { serviceImage } from "@/lib/service-media";
import { withBasePath, withBasePathInStyle } from "@/lib/media-url";
import { aboutPresentation } from "@/lib/about-presentation";
import { supportPresentation } from "@/lib/support-presentation";
import bangladeshFlag from "@/assets/bangladesh-flag.png";
import bannerOne from "@/assets/imported/src/assets/refined/banner-1.jpg";
import bannerTwo from "@/assets/imported/src/assets/refined/banner-2.jpg";
import bannerThree from "@/assets/imported/src/assets/refined/banner-3.jpg";
import bannerBangladesh from "@/assets/lifeos-banner-bangladesh.jpg";
import bannerAi from "@/assets/lifeos-banner-ai.jpg";

const ANNOUNCEMENT_SLIDE_COUNT = 10;
const HERO_SLIDE_INTERVAL = 1900;

type GoogleTranslateWindow = Window & {
  google?: {
    translate?: {
      TranslateElement?: new (
        options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
        elementId: string,
      ) => unknown;
    };
  };
  googleTranslateElementInit?: () => void;
};

const translationLanguages = {
  English: "en",
  "Bahasa Melayu": "ms",
  中文: "zh-CN",
  العربية: "ar",
  বাংলা: "bn",
  Español: "es",
  Português: "pt",
  Polski: "pl",
  Türkçe: "tr",
  Français: "fr",
  Thai: "th",
} as const;

const mediaPointers = import.meta.glob<{ default: string }>("/src/assets/imported/src/assets/restored/tile-*.webp", { eager: true });
const lifeosMedia = new Map<string, string>();
for (const [path, mod] of Object.entries(mediaPointers)) {
  const match = path.match(/tile-([a-z]+)-(\d+)\./);
  if (match) lifeosMedia.set(`${match[1]}/${Number(match[2])}`, mod.default);
}
const hdMedia = import.meta.glob<{ default: string }>("/src/assets/imported/src/assets/hd/tile-*.jpg", { eager: true });
for (const [path, mod] of Object.entries(hdMedia)) {
  const match = path.match(/tile-([a-z]+)-(\d+)\./);
  if (match) lifeosMedia.set(`${match[1]}/${Number(match[2])}`, mod.default);
}
function resolveMedia(html: string): string {
  const services = html.replace(/<img\b[^>]*>/gi, tag => {
    const source = tag.match(/lifeos-media:\/\/services\/(\d{2})/);
    if (!source) return tag;
    const alt = tag.match(/\balt="([^"]*)"/)?.[1] ?? "";
    const image = serviceImage(Number(source[1]), alt);
    return image ? tag.replace(source[0], image) : tag;
  });
  return services.replace(/lifeos-media:\/\/([a-z]+)\/(\d{2})/g, (match, group, number) => group === "services" ? serviceImage(Number(number)) ?? match : lifeosMedia.get(`${group}/${Number(number)}`) ?? match);
}

export type ReferencePage = keyof typeof reference.pages;
const localPages = { index: "/", "page?about": "/about", "page?about-founder": "/founder", "page?about-senior-management": "/senior-management", "page?about-management": "/scientists", "page?about-business-collaboration": "/business-collaboration", "page?about-business-opportunity": "/business-opportunity", "page?about-award": "/awards", "page?about-milestones": "/milestones", "page?p-triple-stemcell-h2o-moisturizer": "/triple-stemcell-h2o", "page?p-double-stemcell": "/double-stemcell", "page?p-crystal-cell": "/crystal-cell", "page?p-videos": "/product-videos", "page?p-certificate": "/halal-certificates", "page?p-halal": "/halal-certificates", "page?halal-certificates": "/halal-certificates", "page?photo-gallery": "/photo-gallery", "page?video-gallery": "/video-gallery", "page?events": "/news-events", "page?event-upcoming": "/latest-event", "page?faq-general": "/faq-general", "page?faq-product": "/faq-product", "page?faq-good-policy": "/faq-return-goods", "page?contact": "/contact", "page?contact-business-center": "/business-center", "page?join-us": "/join-us", "https://app.iphyto.com/member/login.aspx": "/login" } as const;

export function pageHead(page: ReferencePage) {
  const overrides: Partial<Record<ReferencePage, [string, string]>> = {
    contact: ["Contact Us | Life OS BD", "Contact the Life OS BD team for service enquiries, support and business collaboration."],
    "business-center": ["Business Centers | Life OS BD", "Explore Life OS business center locations across Bangladesh and contact the team before visiting."],
    "faq-general": ["General FAQ | Life OS BD", "Answers to common Life OS account, support and registration questions."],
    "faq-product": ["Services FAQ | Life OS BD", "Explore Life OS service availability, digital identity and support."],
    "faq-return-goods": ["Returns & Refunds FAQ | Life OS BD", "Guidance on reporting order issues and requesting returns or refunds."],
  };
  const [title, description] = overrides[page] ?? [reference.pages[page].title, reference.pages[page].description];
  return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}

function CompactCollection({ node, options, limit }: { node: Element; options: HTMLReactParserOptions; limit: number }) {
  const [all, setAll] = useState(false);
  const groups = collectionGroups(node);
  const Tag = node.name === "ul" ? "ul" : node.name === "ol" ? "ol" : "div";
  const id = node.attribs["id"];
  return <><Tag id={id} className={node.attribs["class"]}>{domToReact((all ? groups : groups.slice(0, limit)).flat(), options)}</Tag>{groups.length > limit && <div className="reference-collection-control"><Button variant="reference" size="reference" className="button button-primary" aria-expanded={all} onClick={() => setAll(!all)}>{all ? "Show less" : `View all (${groups.length})`}</Button></div>}</>;
}

// Each video keeps its own banner as poster; every play loads the shared 5s Life OS logo clip.
function PosterVideo({ poster, alt }: { poster: string; alt: string }) {
  const [playing, setPlaying] = useState(false);
  if (playing) return <video className="lifeos-video" src={introVideo} poster={poster} autoPlay controls playsInline onEnded={() => setPlaying(false)} aria-label={alt} />;
  return <Button variant="reference" size="reference" className="lifeos-video-poster" aria-label={`Play ${alt}`} onClick={() => setPlaying(true)}><img className="reference-video-poster" src={poster} alt={alt} loading="lazy" decoding="async" /><img className="lifeos-video-logo" src={logo} alt="" aria-hidden="true" /><span className="lifeos-video-play" aria-hidden="true" /></Button>;
}


export function BrandedPhoto({ src, alt, viewer = false, onOpen, className = "" }: { src: string; alt: string; viewer?: boolean; onOpen?: () => void; className?: string }) {
  const image = <><img className={`lifeos-photo-image ${viewer ? "" : className.replace("img-responsive", "")}`.trim()} src={src} alt={alt} loading="eager" decoding="async" /><img className="lifeos-photo-logo" src={logo} alt="Life OS" aria-hidden="true" /></>;
  return viewer ? <span className="lifeos-photo lifeos-photo-viewer">{image}</span> : !onOpen ? <span className="lifeos-photo">{image}</span> : <Button variant="reference" size="reference" className="lifeos-photo lifeos-photo-action" aria-label={`View ${alt}`} onClick={event => { event.preventDefault(); event.stopPropagation(); onOpen(); }}>{image}</Button>;
}

function ReferenceMarkup({ html, header = false, plain = false }: { html: string; header?: boolean; plain?: boolean }) {
  const branded = (src?: string, c = "") => !header && !plain && !!src && (/tile-events-/.test(src) || /img-responsive/.test(c));
  const [brandedNotice, setBrandedNotice] = useState(false);
  const [menu, setMenu] = useState(false);
  const [submenu, setSubmenu] = useState("");
  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(false); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", close); };
  }, [menu]);
  const [language, setLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedLanguageIcon, setSelectedLanguageIcon] = useState<string | undefined>(withBasePath("/assets/asset-273.webp"));
  const [translationMessage, setTranslationMessage] = useState("");
  const [hidden, setHidden] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState(0);
  useEffect(() => {
    if (!html.includes('id="announcement"')) return;
    const interval = window.setInterval(() => {
      setAnnouncement(current => (current + 1) % ANNOUNCEMENT_SLIDE_COUNT);
    }, HERO_SLIDE_INTERVAL);
    return () => window.clearInterval(interval);
  }, [html]);
  const [expanded, setExpanded] = useState("accordion1-card-body-bprghjla");
  const [notice, setNotice] = useState<string>();
  const [formMessage, setFormMessage] = useState("");
  const [captcha, setCaptcha] = useState("7424");
  useEffect(() => {
    if (!header) return;
    const googleWindow = window as GoogleTranslateWindow;
    const initialize = () => {
      const TranslateElement = googleWindow.google?.translate?.TranslateElement;
      if (!TranslateElement) {
        setTranslationMessage("Google translation could not be initialized. Please reload and try again.");
        return;
      }
      const host = document.getElementById("google_translate_element");
      if (!host || host.querySelector(".goog-te-combo")) return;
      try {
        new TranslateElement({
          pageLanguage: "en",
          includedLanguages: Object.values(translationLanguages).join(","),
          autoDisplay: false,
        }, host.id);
        host.dataset["initialized"] = "true";
      } catch (error) {
        console.error("Google Translate initialization failed", error);
        setTranslationMessage("Google translation could not be initialized. Please reload and try again.");
      }
    };
    googleWindow.googleTranslateElementInit = initialize;
    if (googleWindow.google?.translate?.TranslateElement) {
      initialize();
    } else if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () => setTranslationMessage("Google translation is unavailable. Please try again later.");
      document.head.appendChild(script);
    }
  }, [header]);

  const translateTo = (name: string, icon?: string) => {
    const code = translationLanguages[name as keyof typeof translationLanguages];
    if (!code) {
      setTranslationMessage("This language is not available for translation.");
      return;
    }
    setTranslationMessage("Loading Google translation…");
    let attempts = 0;
    const applyTranslation = () => {
      const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      const values = select ? Array.from(select.options).map(option => option.value) : [];
      const value = values.includes(code) ? code : code === "en" && values.includes("") ? "" : undefined;
      if (select && value !== undefined) {
        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        setSelectedLanguage(name);
        setSelectedLanguageIcon(icon ?? (name === "বাংলা" ? bangladeshFlag : undefined));
        setTranslationMessage("");
        setLanguage(false);
        setSubmenu("");
        setMenu(false);
        return;
      }
      if (attempts >= 50) {
        setTranslationMessage("Google translation is not ready. Please try again later.");
        return;
      }
      attempts += 1;
      window.setTimeout(applyTranslation, 100);
    };
    applyTranslation();
  };

  useEffect(() => {
    if (!notice) { setBrandedNotice(false); return; }
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setNotice(undefined); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", close); };
  }, [notice]);
  const [tab, setTab] = useState("#home");
  const [panel, setPanel] = useState("collapseOne");
  const parsed = resolveMedia(html);
  const options: HTMLReactParserOptions = {
    replace(node, index) {
      if (!(node instanceof Element)) return;
      const attrs = { ...node.attribs };
      for (const name of ["src", "href", "poster", "data-src", "data-original"]) {
        if (attrs[name]) attrs[name] = withBasePath(attrs[name]);
      }
      if (attrs["srcset"]) {
        attrs["srcset"] = attrs["srcset"].replace(
          /(^|,)\s*(\/(?!\/)[^,\s]+)/g,
          (_match, separator: string, url: string) =>
            `${separator}${separator ? " " : ""}${withBasePath(url)}`,
        );
      }
      if (attrs["style"]) attrs["style"] = withBasePathInStyle(attrs["style"]);
      const cls = attrs["class"] ?? "";
      const children = () => domToReact(node.children as DOMNode[], options);
      if (header && node.name === "a" && attrs["href"] === "page?audio-gallery") return <Link className={cls} to="/audio-gallery">{children()}</Link>;
      if (attrs["id"] === "change-image") return <Button variant="reference" size="reference" className="lifeos-captcha-refresh" aria-label="Refresh verification code" onClick={() => setCaptcha(String(Math.floor(1000 + Math.random() * 9000)))}>↻</Button>;
      if (cls.includes("captcha-text")) return <span className={cls}>{captcha}</span>;
      if (node.name === "input" || node.name === "select" || node.name === "textarea") {
        const props = attributesToProps(attrs);
        const name = attrs["name"];
        const ariaLabel = attrs["aria-label"] ?? attrs["placeholder"] ?? name?.replaceAll("_", " ");
        if (node.name === "input") return <input {...props} aria-label={ariaLabel} defaultValue={attrs["value"]} value={undefined} />;
        if (node.name === "select") return <select {...props} aria-label={ariaLabel}>{children()}</select>;
        return <textarea {...props} aria-label={ariaLabel}>{children()}</textarea>;
      }
      if (node.name === "script" || node.name === "style") return <></>;
      const limit = header ? undefined : collectionLimit(node);
      if (limit && collectionGroups(node).length > limit) return <CompactCollection node={node} options={options} limit={limit} />;
      if (node.name === "img") {
        const imageSrc = attrs["src"];
        if (imageSrc && branded(imageSrc, cls)) return <BrandedPhoto src={imageSrc} alt={attrs["alt"] ?? "Life OS photo"} className={cls} onOpen={() => { setBrandedNotice(true); setNotice(imageSrc); }} />;
        if (imageSrc && cls.includes("reference-video-poster")) return <PosterVideo poster={imageSrc} alt={attrs["alt"] ?? "Life OS video"} />;
        const service = /\/service-\d{2}[.-]/.test(attrs["src"] ?? "");
        const px = (v?: string) => v && /^\d+$/.test(v) ? Number(v) : undefined;
        return <img {...attributesToProps(attrs)} className={`${cls}${service ? " reference-service-image" : ""}`} width={service ? 1920 : px(attrs["width"])} height={service ? 1080 : px(attrs["height"])} alt={attrs["alt"] ?? ""} loading="lazy" decoding="async" />;
      }
      if (cls === "box" && attrs["data-toggle"] === "modal") {
        const image = node.children.find(n => n instanceof Element && n.name === "img");
        return <Button variant="reference" size="reference" className={cls} aria-label={image instanceof Element ? image.attribs["alt"] : "View certificate"} onClick={() => { if (image instanceof Element) setNotice(image.attribs["src"]); }}>{children()}</Button>;
      }
      if (cls.includes("alert-primary") && hidden.includes(index)) return <></>;
      if (cls.includes("nav-link") && attrs["data-toggle"] === "tab") { const t = attrs["data-target"] ?? ""; return <Button variant="reference" size="reference" className={`nav-link ${tab === t ? "active" : ""}`} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{children()}</Button>; }
      if (cls.includes("tab-pane")) return <div id={attrs["id"]} role="tabpanel" className={`tab-pane fade ${tab === "#" + attrs["id"] ? "show active" : ""}`}>{children()}</div>;
      if (node.name === "button") {
        const close = cls.includes("close");
        if (cls.includes("rd-navbar-toggle")) return <Button variant="reference" size="reference" className={`${cls} ${menu ? "active" : ""}`} aria-label={menu ? "Close navigation" : "Open navigation"} aria-expanded={menu} aria-controls="lifeos-navigation" onClick={() => setMenu(!menu)}>{menu ? <X size={22} /> : <Menu size={22} />}</Button>;
        if (header && attrs["type"] === "submit") return <Button variant="reference" size="reference" className={cls} type="submit" aria-label="Search">{children()}</Button>;
        const isDesktopLanguageToggle = header && cls.includes("dropdown-toggle");
        const languageIcon = selectedLanguageIcon?.startsWith("/")
          ? <img src={selectedLanguageIcon} alt="" aria-hidden="true" />
          : selectedLanguageIcon && <span aria-hidden="true">{selectedLanguageIcon}</span>;
        const buttonContent = isDesktopLanguageToggle
          ? <>{languageIcon}<span>{selectedLanguage}</span></>
          : children();
        return <Button variant="reference" size="reference" className={cls} type={attrs["type"] === "submit" ? "submit" : "button"} aria-label={attrs["aria-label"]} onClick={close ? (event) => { const el = event.currentTarget.closest(".alert"); if (el) (el as HTMLElement).hidden = true; setHidden([...hidden]); } : cls.includes("rd-navbar-toggle") ? () => setMenu(!menu) : cls.includes("dropdown-toggle") ? () => setLanguage(!language) : undefined}>{buttonContent}</Button>;
      }
      if (cls.includes("rd-navbar-nav-wrap")) return <>{menu && <Button variant="reference" size="reference" className="lifeos-menu-backdrop" aria-label="Dismiss navigation" onClick={() => setMenu(false)} />}<div id="lifeos-navigation" className={`${cls} ${menu ? "mobile-open" : ""}`}>{menu && <div className="lifeos-drawer-head"><Button variant="reference" size="reference" className="lifeos-drawer-close" aria-label="Close navigation" onClick={() => setMenu(false)}><X size={20} /></Button><img src={logo} alt="Life OS" /></div>}{children()}</div></>;
      if (cls === "dropdown-menu") {
        const isHeaderLanguageMenu = header && node.parent instanceof Element && node.parent.attribs["class"]?.split(/\s+/).includes("rd-navbar-basket-wrap");
        return <div className={`${cls} ${language ? "show" : ""}`}>{children()}{isHeaderLanguageMenu && <a className="dropdown-item" href="#" lang="bn" onClick={event => { event.preventDefault(); translateTo("বাংলা", bangladeshFlag); }}><img className="lifeos-language-flag" src={bangladeshFlag} alt="" aria-hidden="true" />বাংলা</a>}{isHeaderLanguageMenu && translationMessage && <span className="lifeos-translation-status" role="status">{translationMessage}</span>}</div>;
      }
      if (header && node.name === "ul" && cls.includes("rd-menu") && node.parent instanceof Element && node.parent.attribs["class"]?.split(/\s+/).includes("language")) {
        return <ul className={cls}>{children()}<li className="rd-dropdown-item"><a className="rd-dropdown-link" href="#" lang="bn" onClick={event => { event.preventDefault(); translateTo("বাংলা", bangladeshFlag); }}><img className="lifeos-language-flag" src={bangladeshFlag} alt="" aria-hidden="true" />বাংলা</a></li></ul>;
      }
      if (cls.includes("rd-nav-item") || cls.includes("language")) {
        const link = node.children.find(child => child instanceof Element && child.name === "a");
        const key = link instanceof Element ? link.children.filter(child => child.type === "text").map(child => "data" in child ? child.data : "").join("").trim() : "";
        return <li className={`${cls.replace(/active/g, "")} ${submenu === key ? "lifeos-submenu-open" : ""}`}>{children()}{header && cls.includes("language") && translationMessage && <span className="lifeos-translation-status" role="status">{translationMessage}</span>}</li>;
      }
      if (cls.includes("panel-collapse")) return <div id={attrs["id"]} className={`panel-collapse collapse ${attrs["id"] && panel === attrs["id"] ? "show" : ""}`}>{children()}</div>;
      if (node.name === "form" && (cls.includes("contactForm") || cls.includes("registerForm"))) return <form className={cls} onSubmit={e => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        if (cls.includes("registerForm") && data.get("captcha_no") !== captcha) { setFormMessage("The verification code does not match. Please try again."); return; }
        const lines = Array.from(data.entries()).filter(([key]) => !["lan", "captcha_no"].includes(key)).map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`).join("\n");
        window.location.href = `mailto:info@lifeosbd.com?subject=${encodeURIComponent(cls.includes("contactForm") ? "Life OS contact enquiry" : "Life OS joining enquiry")}&body=${encodeURIComponent(lines)}`;
        setFormMessage("Your email draft is ready. Send it from your email app to complete your enquiry.");
      }}>{children()}{formMessage && <p className="lifeos-form-message" role="status">{formMessage}</p>}</form>;
      if (node.name === "form") return <form className="reference-search" action="#" method="post">{children()}</form>;
      if (cls.includes("carousel-item")) {
        const siblings = node.parent?.children.filter(n => n instanceof Element && n.attribs["class"]?.includes("carousel-item")) ?? [];
        const slideIndex = siblings.indexOf(node);
        return <div className={`carousel-item ${announcement === slideIndex ? "active" : ""}`}>{children()}</div>;
      }
      if (cls.includes("carousel-indicators")) return <></>;
      if (cls.includes("modal fade")) return <></>;
      if (cls.includes("collapse") && attrs["id"]?.startsWith("accordion1-card-body")) return <div id={attrs["id"]} className={`collapse ${expanded === attrs["id"] ? "show" : ""}`}>{children()}</div>;
      if (node.name === "a") {
        const eventPhoto = (nodes: DOMNode[]): boolean => nodes.some(child => child instanceof Element && (child.name === "img" && /tile-events-/.test(child.attribs["src"] ?? "") || eventPhoto(child.children as DOMNode[])));
        if (eventPhoto(node.children as DOMNode[])) return <div className={cls}>{children()}</div>;
        const href = attrs["href"] ?? "#";
        if (header && cls.includes("rd-nav-link") && node.parent instanceof Element && node.parent.children.some(child => child instanceof Element && child.attribs["class"]?.includes("rd-menu"))) {
          const key = node.children.filter(child => child.type === "text").map(child => "data" in child ? child.data : "").join("").trim();
          const isLanguageToggle = node.parent.attribs["class"]?.split(/\s+/).includes("language");
          const buttonContent = isLanguageToggle
            ? <>{selectedLanguageIcon?.startsWith("/") ? <img src={selectedLanguageIcon} alt="" aria-hidden="true" /> : selectedLanguageIcon && <span aria-hidden="true">{selectedLanguageIcon}</span>}<span>{selectedLanguage}</span></>
            : children();
          return <Button variant="reference" size="reference" className={`${cls} lifeos-submenu-toggle`} aria-expanded={submenu === key} onClick={() => setSubmenu(submenu === key ? "" : key)}>{buttonContent}<ChevronDown size={15} aria-hidden="true" /></Button>;
        }
        if (header && cls.includes("dropdown-item") && node.parent instanceof Element && node.parent.attribs["class"]?.split(/\s+/).includes("dropdown-menu")) {
          const name = node.children.filter(child => child.type === "text").map(child => "data" in child ? child.data : "").join("").trim();
          const image = node.children.find(child => child instanceof Element && child.name === "img");
          const icon = image instanceof Element ? image.attribs["src"] : undefined;
          return <a className={cls} href={href} onClick={event => { event.preventDefault(); translateTo(name, icon); }}>{children()}</a>;
        }
        const parent = node.parent;
        const isLanguageOption = header && cls.includes("rd-dropdown-link")
          && parent instanceof Element
          && parent.parent instanceof Element
          && parent.parent.parent instanceof Element
          && parent.parent.parent.attribs["class"]?.split(/\s+/).includes("language");
        if (isLanguageOption) {
          const name = node.children.filter(child => child.type === "text").map(child => "data" in child ? child.data : "").join("").trim();
          const image = node.children.find(child => child instanceof Element && child.name === "img");
          const icon = image instanceof Element ? image.attribs["src"] : undefined;
          return <a className={cls} href={href} onClick={event => { event.preventDefault(); translateTo(name, icon); }}>{children()}</a>;
        }
        if (header && cls === "brand") return <Link className={cls} to="/">{children()}</Link>;
        if (href === "#" && node.children.some(child => child.type === "text" && "data" in child && /read\s*more/i.test(child.data))) return <Link className={cls} to="/news-events">{children()}</Link>;
        if (cls.includes("cbp-singlePage")) {
          const findImage = (nodes: DOMNode[]): Element | undefined => { for (const child of nodes) { if (child instanceof Element) { if (child.name === "img") return child; const found = findImage(child.children as DOMNode[]); if (found) return found; } } return undefined; };
          const image = findImage(node.children as DOMNode[]) ?? (node.parent instanceof Element ? findImage(node.parent.children as DOMNode[]) : undefined);
          return <a href={image?.attribs["src"] ?? href} className={cls} onClick={e => { if (image) { e.preventDefault(); setNotice(image.attribs["src"]); } }}>{children()}</a>;
        }
        if (href.startsWith("#collapse")) { const id = href.slice(1); return <a href={href} className={`${cls} ${panel === id ? "" : "collapsed"}`} aria-expanded={panel === id} onClick={e => { e.preventDefault(); setPanel(panel === id ? "" : id); }}>{children()}</a>; }
        if (href in localPages) return <Link className={cls} to={localPages[href as keyof typeof localPages]} onClick={() => setMenu(false)}>{children()}</Link>;
        if (attrs["data-target"]?.startsWith(".annoucement")) return <a href="#" className={cls} onClick={e => { e.preventDefault(); const find = (ns: DOMNode[]): Element | undefined => { for (const n of ns) { if (n instanceof Element) { if (n.name === "img") return n; const r = find(n.children as DOMNode[]); if (r) return r; } } return undefined; }; const img = find(node.children as DOMNode[]); if (img) setNotice(img.attribs["src"]); }}>{children()}</a>;
        if (cls.includes("carousel-control")) return <Button variant="reference" size="reference" className={cls} aria-label={cls.includes("prev") ? "Previous announcement" : "Next announcement"} onClick={() => setAnnouncement((announcement + (cls.includes("prev") ? ANNOUNCEMENT_SLIDE_COUNT - 1 : 1)) % ANNOUNCEMENT_SLIDE_COUNT)}>{children()}</Button>;
        if (href.startsWith("#accordion1")) return <Button variant="reference" size="reference" className={expanded === href.slice(1) ? "" : "collapsed"} aria-expanded={expanded === href.slice(1)} onClick={() => setExpanded(expanded === href.slice(1) ? "" : href.slice(1))}>{children()}</Button>;
        if (href.startsWith("page?") || href.startsWith("?")) return <a className={cls} href="#">{children()}</a>;
      }
      if (node.name === "a" && attrs["href"] !== node.attribs["href"]) {
        return <a {...attributesToProps(attrs)}>{children()}</a>;
      }
      return undefined;
    },
  };
  return <>{parse(parsed, options)}{header && <div id="google_translate_element" className="lifeos-google-translate" aria-hidden="true" />}{notice && <div className="reference-modal" role="dialog" aria-modal="true" aria-label="Life OS photo" onClick={() => setNotice(undefined)}><div className="reference-modal-body" onClick={event => event.stopPropagation()}><Button variant="reference" className="close" aria-label="Close notice" onClick={() => { setNotice(undefined); setBrandedNotice(false); }}>×</Button><BrandedPhoto src={notice} alt={brandedNotice ? "Life OS photo" : "Life OS gallery image"} viewer /></div></div>}</>;
}

function Banner({ page }: { page: ReferencePage }) {
  const slides = page === "home" ? [bannerOne, bannerTwo, bannerThree, bannerBangladesh, bannerAi] : [bannerOne, bannerTwo, bannerThree];
  const [slide, setSlide] = useState(page === "home" ? 0 : page === "awards" || page === "news-events" || page === "business-opportunity" ? 2 : 1);
  useEffect(() => {
    if (page !== "home") return;
    const interval = window.setInterval(() => {
      setSlide(current => (current + 1) % slides.length);
    }, HERO_SLIDE_INTERVAL);
    return () => window.clearInterval(interval);
  }, [page, slides.length]);
  return <section className="reference-banner" aria-label="Life OS highlights"><img src={slides[slide]} alt="Life OS — One Life ID. One App. Unlimited Services." /><div className="reference-pagination">{slides.map((path, i) => <Button variant="reference" size="reference" key={path} aria-label={`Go to slide ${i + 1}`} className={i === slide ? "selected" : ""} onClick={() => setSlide(i)}>{String(i + 1).padStart(2, "0")}</Button>)}</div></section>;
}

export function ReferenceSite({ page, content, html }: { page: ReferencePage; content?: React.ReactNode; html?: string }) {
  const product = ["triple-stemcell-h2o", "double-stemcell", "crystal-cell"].includes(page);
  const about = ["about", "founder", "management", "scientists", "business-collaboration", "business-opportunity", "awards", "milestones"].includes(page);
  return <div className={`reference-site reference-${page} ${about ? "lifeos-about-page" : ""} ${product ? "reference-product" : ""}`}><ReferenceMarkup html={reference.header} header />{!product && <Banner key={page} page={page} />}<main>{content ?? <ReferenceMarkup key={page} html={html ?? supportPresentation(page, aboutPresentation(page, reference.pages[page].html))} />}</main><ReferenceMarkup html={reference.footer} plain /><Button variant="reference" size="reference" className="ui-to-top fa fa-arrow-up active" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} /></div>;
}