import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BrandedPhoto, ReferenceSite } from "@/components/reference-site";
import { Button } from "@/components/ui/button";
import { findServicePage, heroImage, servicePages, tileImage } from "@/lib/service-pages";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => { const page = findServicePage(params.slug); if (!page) throw notFound(); return page; },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} | Life OS Services` : "Life OS Services";
    const description = loaderData ? `${loaderData.tagline} ${loaderData.intro}`.slice(0, 160) : "Life OS services";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  notFoundComponent: () => <ReferenceSite page="home" />,
  component: ServiceDetail,
});

function ServiceDetail() {
  const s = Route.useLoaderData();
  const related = servicePages.filter(p => p.group === s.group && p.slug !== s.slug).slice(0, 4);
  return (
    <ReferenceSite page="crystal-cell" content={
      <>
        <div className="product-banner service-page-hero">
          <BrandedPhoto src={heroImage(s.slug) ?? ""} alt={`${s.title} with Life OS`} />
        </div>
        <section id="product" className="service-page">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <h2 className="product-heading">{s.title}</h2>
                <h1 className="page-title service-page-tagline">{s.tagline}</h1>
                <p className="service-page-intro">{s.intro}</p>
                <Button variant="reference" size="reference" asChild><Link to="/join-us" className="btn btn-knowme">Get Started</Link></Button>
              </div>
              <div className="col-md-6"><BrandedPhoto src={tileImage(s.tiles[0] ?? 1) ?? ""} alt={`${s.title} service`} className="reference-service-image" /></div>
            </div>
            <h3 className="product-heading mt-3">Key Features</h3>
            <div className="row service-page-features">
              {s.features.map(([name, text], i) => (
                <div className="col-sm-4" key={name}>
                  <BrandedPhoto src={tileImage(s.tiles[i] ?? 1) ?? ""} alt={name} className="reference-service-image" />
                  <h4 className="product-ingredient">{name}</h4>
                  <p>{text}</p>
                </div>
              ))}
            </div>
            <h3 className="product-heading mt-3">How It Works</h3>
            <ol className="service-page-steps">{s.steps.map(step => <li key={step}>{step}</li>)}</ol>
            <h3 className="product-heading mt-3">More {s.group} Services</h3>
            <div className="row service-page-related">
              {related.map(r => (
                <div className="col-sm-3" key={r.slug}>
                  <Link to="/services/$slug" params={{ slug: r.slug }}>
                    <BrandedPhoto src={heroImage(r.slug) ?? ""} alt={r.title} />
                    <span>{r.title}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    } />
  );
}
