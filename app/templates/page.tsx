"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const previewStyles = {
  classicNavy: {
    background: "bg-slate-50",
    gradient: "from-slate-100 via-slate-100/70 to-slate-200",
    accent: "bg-slate-700",
  },
  minimalGray: {
    background: "bg-gray-50",
    gradient: "from-gray-100 via-gray-100/70 to-gray-200",
    accent: "bg-gray-700",
  },
  boldIndigo: {
    background: "bg-indigo-50",
    gradient: "from-indigo-100 via-indigo-100/70 to-indigo-200",
    accent: "bg-indigo-600",
  },
  cleanSlate: {
    background: "bg-slate-50",
    gradient: "from-slate-100 via-slate-100/70 to-slate-200",
    accent: "bg-slate-800",
  },
  freshGreen: {
    background: "bg-emerald-50",
    gradient: "from-emerald-100 via-emerald-100/70 to-emerald-200",
    accent: "bg-emerald-600",
  },
  executiveBlue: {
    background: "bg-blue-50",
    gradient: "from-blue-100 via-blue-100/70 to-blue-200",
    accent: "bg-blue-800",
  },
  startupPurple: {
    background: "bg-purple-50",
    gradient: "from-purple-100 via-purple-100/70 to-purple-200",
    accent: "bg-purple-600",
  },
  agencyOrange: {
    background: "bg-orange-50",
    gradient: "from-orange-100 via-orange-100/70 to-orange-200",
    accent: "bg-orange-500",
  },
  techCyan: {
    background: "bg-cyan-50",
    gradient: "from-cyan-100 via-cyan-100/70 to-cyan-200",
    accent: "bg-cyan-600",
  },
  artisanRose: {
    background: "bg-rose-50",
    gradient: "from-rose-100 via-rose-100/70 to-rose-200",
    accent: "bg-rose-600",
  },
  neonLime: {
    background: "bg-lime-50",
    gradient: "from-lime-100 via-lime-100/70 to-lime-200",
    accent: "bg-lime-600",
  },
  editorialAmber: {
    background: "bg-amber-50",
    gradient: "from-amber-100 via-amber-100/70 to-amber-200",
    accent: "bg-amber-600",
  },
} as const;

const getPreviewStyle = (styleKey: keyof typeof previewStyles) => previewStyles[styleKey] ?? previewStyles.classicNavy;
const TOTAL_TEMPLATE_COUNT = 50;
const templateCategories = ["Classic", "Modern", "Bold", "Minimal"] as const;
type TemplateCategory = (typeof templateCategories)[number];
const categories = ["All", ...templateCategories] as const;
type Category = (typeof categories)[number];

type TemplateMeta = {
  id: number;
  name: string;
  category: TemplateCategory;
  style: keyof typeof previewStyles;
  description: string;
  tags: string[];
};

const curatedTemplates: TemplateMeta[] = [
  {
    id: 1,
    name: "Classic Professional",
    category: "Classic",
    style: "classicNavy",
    description: "Serif headings, column layout and generous spacing for corporate teams.",
    tags: ["Serif headings", "Split details"],
  },
  {
    id: 2,
    name: "Modern Minimal",
    category: "Minimal",
    style: "minimalGray",
    description: "Neutral palette with thin dividers and a modular grid ideal for studios.",
    tags: ["Neutral palette", "Thin dividers"],
  },
  {
    id: 3,
    name: "Bold Business",
    category: "Bold",
    style: "boldIndigo",
    description: "High-contrast accent column that draws focus to totals and CTA.",
    tags: ["Accent column", "Strong CTA"],
  },
  {
    id: 4,
    name: "Clean Corporate",
    category: "Classic",
    style: "cleanSlate",
    description: "Subtle slate gradients with stacked information blocks for clarity.",
    tags: ["Stacked blocks", "Muted gradients"],
  },
  {
    id: 5,
    name: "Fresh & Simple",
    category: "Modern",
    style: "freshGreen",
    description: "Playful green highlights with rounded cards for creative agencies.",
    tags: ["Rounded cards", "Playful accent"],
  },
  {
    id: 6,
    name: "Executive Elite",
    category: "Classic",
    style: "executiveBlue",
    description: "Deep navy headline stripe and signature area for premium services.",
    tags: ["Headline stripe", "Signature block"],
  },
  {
    id: 7,
    name: "Startup Style",
    category: "Modern",
    style: "startupPurple",
    description: "Vibrant gradients, bold typography and tag-style totals for SaaS teams.",
    tags: ["Gradient hero", "Tag totals"],
  },
  {
    id: 8,
    name: "Creative Agency",
    category: "Bold",
    style: "agencyOrange",
    description: "Asymmetric layout with orange hero card for storytelling invoices.",
    tags: ["Asymmetric", "Hero card"],
  },
  {
    id: 9,
    name: "Tech Forward",
    category: "Minimal",
    style: "techCyan",
    description: "Lightweight cyan grid and mono-spaced totals for data-driven teams.",
    tags: ["Mono totals", "Grid layout"],
  },
  {
    id: 10,
    name: "Boutique Artisan",
    category: "Bold",
    style: "artisanRose",
    description: "Warm rose palette with script-inspired accents for boutiques.",
    tags: ["Script accent", "Warm palette"],
  },
  {
    id: 11,
    name: "Neon Studio",
    category: "Bold",
    style: "neonLime",
    description: "Lime highlight blocks plus condensed headings for experimental brands.",
    tags: ["Highlight blocks", "Condensed type"],
  },
  {
    id: 12,
    name: "Editorial Amber",
    category: "Classic",
    style: "editorialAmber",
    description: "Magazine-inspired amber accents with fine rules and generous padding.",
    tags: ["Magazine rules", "Generous padding"],
  },
];
const categoryBlueprints: Record<TemplateCategory, { descriptions: string[]; tags: string[] }> = {
  Classic: {
    descriptions: [
      "leans on serif headers and double rules to keep enterprise summaries timeless.",
      "stacks address blocks with ledger-inspired totals for dependable reporting.",
      "pairs understated borders with signature-ready footers for finance teams.",
      "mixes ivory panels with classic numerals to highlight payment details.",
    ],
    tags: ["Serif headers", "Ledger totals", "Signature bar", "Double rules", "Tax summary"],
  },
  Modern: {
    descriptions: [
      "uses rounded cards and modular spacing for studio-ready invoices.",
      "features pill totals and soft gradients suited to SaaS dashboards.",
      "keeps mono labels with flexible grids for productized services.",
      "highlights key metrics with split columns and responsive gutters.",
    ],
    tags: ["Rounded cards", "Soft gradients", "Mono labels", "Flexible grids", "Metric callouts"],
  },
  Bold: {
    descriptions: [
      "drops a hero stripe with oversized totals to command attention.",
      "layers contrast blocks and condensed headings for fearless brands.",
      "uses badge-style totals plus diagonal dividers for dramatic flair.",
      "combines high-impact color with geometric framing around payment info.",
    ],
    tags: ["Hero stripe", "Oversized totals", "Contrast blocks", "Badge totals", "Diagonal divider"],
  },
  Minimal: {
    descriptions: [
      "relies on thin rules, airy margins, and mono type for consultancy-ready calm.",
      "keeps the canvas white with fine labels and generous breathing room.",
      "balances grids and whisper-thin dividers for architecture studios.",
      "pushes totals into quiet columns with understated accent bars.",
    ],
    tags: ["Thin rules", "Airy margins", "Mono type", "Quiet totals", "Light grids"],
  },
};

const adjectivePool = ["Summit", "Harbor", "Echo", "Vertex", "Lumen", "Atlas", "Nova", "Mosaic", "Lucid", "Prime"];
const finishPool = ["Slate", "Amber", "Indigo", "Citrine", "Umber", "Frost", "Cobalt", "Coral", "Obsidian", "Ivory"];
const styleKeys = Object.keys(previewStyles) as (keyof typeof previewStyles)[];

const buildGeneratedTemplates = (): TemplateMeta[] => {
  const generated: TemplateMeta[] = [];
  let nextId = curatedTemplates.length + 1;

  outer: for (const adjective of adjectivePool) {
    for (const finish of finishPool) {
      if (nextId > TOTAL_TEMPLATE_COUNT) {
        break outer;
      }
      const category = templateCategories[(nextId - 1) % templateCategories.length];
      const blueprint = categoryBlueprints[category];
      const descriptor = blueprint.descriptions[(nextId - 1) % blueprint.descriptions.length];
      const tagStart = (nextId - 1) % blueprint.tags.length;
      const tags = [
        blueprint.tags[tagStart],
        blueprint.tags[(tagStart + 1) % blueprint.tags.length],
      ];
      const name = `${adjective} ${finish}`;

      generated.push({
        id: nextId,
        name,
        category,
        style: styleKeys[(nextId - 1) % styleKeys.length],
        description: `${name} ${descriptor}`,
        tags,
      });

      nextId += 1;
    }
  }

  return generated;
};

const templates: TemplateMeta[] = [...curatedTemplates, ...buildGeneratedTemplates()];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filteredTemplates = useMemo(() => {
    if (activeCategory === "All") {
      return templates;
    }
    return templates.filter((template) => template.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              invoicetable
            </Link>
            <nav className="flex gap-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/guide" className="text-gray-600 hover:text-gray-900 transition-colors">
                Guide
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Invoice Templates</h1>
          <p className="text-lg text-gray-600">
            {TOTAL_TEMPLATE_COUNT} curated invoice systems spanning Classic, Modern, Bold and Minimal aesthetics. Every design accepts the same URL parameters so you
            can swap styles without touching your data source.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                category === activeCategory
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => {
            const preview = getPreviewStyle(template.style);
            return (
              <Link
                key={template.id}
                href={`/invoice/${template.id}?invoiceNumber=SAMPLE-001&supplier=Your%20Company%0A123%20Business%20St&customer=Client%20Name%0A456%20Client%20Ave&issueDate=2024-01-15&dueDate=2024-02-15&bankAccount=123456789/0100&description=Consulting%20Services&quantity=10&price=150&comment=Thank%20you%20for%20your%20business&currency=usd`}
                className="group block"
              >
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-gray-900 transition-all hover:shadow-lg">
                  {/* Preview Box */}
                  <div className={`${preview.background} rounded-lg h-48 mb-4 flex items-center justify-center relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${preview.gradient}`}></div>
                    <div className="relative z-10 text-center">
                      <div className={`w-16 h-16 ${preview.accent} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white">#{template.id}</span>
                      </div>
                      <div className="text-xs text-gray-700 font-medium px-3 py-1 bg-white rounded-full inline-block">{template.category}</div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700">{template.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Preview Button */}
                  <div className="mt-4 text-sm text-gray-600 group-hover:text-gray-900 font-medium">Preview →</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            All Templates Use the Same Parameters
          </h2>
          <p className="text-gray-600 mb-8">
            Every template accepts the same URL parameters, making it easy to switch between designs without changing your Google Sheets formula.
          </p>
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Learn How to Use Templates
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
