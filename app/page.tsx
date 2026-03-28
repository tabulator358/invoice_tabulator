import Link from "next/link";
import InvoiceTableDemo from "@/components/InvoiceTableDemo";

const GOOGLE_SHEETS_COPY_URL =
  "https://docs.google.com/spreadsheets/d/1CFG2-4_wD285WKL3NKCmIi4IJru2m9pIB5In0QS-jus/copy";
const GOOGLE_SHEETS_PREVIEW_URL =
  "https://docs.google.com/spreadsheets/d/1CFG2-4_wD285WKL3NKCmIi4IJru2m9pIB5In0QS-jus/edit?usp=sharing";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">invoicetable</h1>
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:gap-8">
              <Link
                href="#google-sheets"
                className="text-sm font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-500 transition-colors"
              >
                Google Sheets copy
              </Link>
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#templates" className="text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </Link>
              <Link href="#guide" className="text-gray-600 hover:text-gray-900 transition-colors">
                Guide
              </Link>
              <Link
                href="#invoice-table"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Invoice table
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Turn Your Spreadsheet Into Professional Invoices
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            Just add your data to Google Sheets. We turn it into beautiful invoices instantly.
            No account needed. Seriously, it&apos;s that simple.
          </p>
          <p className="text-base text-gray-600 mb-8 max-w-xl mx-auto">
            Start with a copy of our sheet in your Drive — then add data and use the invoice links.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <a
              href={GOOGLE_SHEETS_COPY_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <svg
                className="h-4 w-4 shrink-0 opacity-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
              Make your own Google Sheet copy
            </a>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              See Templates
            </Link>
            <Link
              href="#guide"
              className="inline-flex items-center justify-center px-6 py-2.5 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              How It Works
            </Link>
          </div>
          <p className="mt-5 text-sm text-gray-500">
            <a
              href={GOOGLE_SHEETS_PREVIEW_URL}
              target="_blank"
              rel="noreferrer"
              className="text-gray-700 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-500"
            >
              Preview the sheet
            </a>
            {" "}without copying.
          </p>
        </div>
      </section>

      {/* Interactive invoice table (demo) */}
      <section id="invoice-table" className="border-y border-gray-200 bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">
            The invoice table
          </h3>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            Edit any cell below — the Link column updates automatically with the same URL
            shape as your Google Sheets formula.
          </p>
          <InvoiceTableDemo />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-16">
            Why This Is So Simple
          </h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                No Software to Install
              </h4>
              <p className="text-gray-600">
                Works directly in your browser. Just use Google Sheets like you always do.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                One Simple Formula
              </h4>
              <p className="text-gray-600">
                Copy our formula, paste it in your sheet. Every row becomes a clickable invoice link.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                50 Professional Templates
              </h4>
              <p className="text-gray-600">
                Pick any design you like. Switch templates anytime by changing one number.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="guide" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-16">
            3 Steps. That&apos;s It.
          </h3>
          <div className="space-y-12">
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Create a Google Sheet
                </h4>
                <p className="text-gray-600">
                  Add columns for your invoice info. Invoice number, who&apos;s paying, amount, date - whatever you need.
                </p>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Paste Our Formula
                </h4>
                <p className="text-gray-600">
                  We give you one formula. Copy it into a new column. It automatically creates invoice links.
                </p>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Click & Download
                </h4>
                <p className="text-gray-600">
                  Click any link to see the invoice. Download as PDF. Send to client. Done.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 text-gray-900 font-medium hover:underline"
            >
              See the complete setup guide
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Section — Google Sheets */}
      <section id="google-sheets" className="scroll-mt-24 py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Google Sheets
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Copy the template to your Drive, then fill in rows — each line can link to a printable invoice.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Make your own copy
                </h4>
                <p className="text-sm text-gray-600 max-w-xl">
                  Saves a private spreadsheet in your Google account.
                </p>
              </div>
              <a
                href={GOOGLE_SHEETS_COPY_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Copy to my Drive
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Preview</h4>
                <p className="text-sm text-gray-600">
                  View the public sheet (read-only). To edit, use your own copy above.
                </p>
              </div>
              <a
                href={GOOGLE_SHEETS_PREVIEW_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Open in Google Sheets
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">Video walkthrough</h3>
            <div className="relative pt-[56.25%] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dX-3886-0BM"
                title="invoicetable demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Start Now. Takes 5 Minutes.
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            No credit card. No signup. Just pick a template and you&apos;re done.
          </p>
          <Link
            href="/templates"
            className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Pick a Template
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">© 2024 invoicetable. Simple invoice generation from Google Sheets.</p>
            <p className="text-sm">No signup required. No data stored. Privacy-first.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
