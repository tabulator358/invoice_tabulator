import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Invoicer</h1>
            <nav className="flex gap-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#templates" className="text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </Link>
              <Link href="#guide" className="text-gray-600 hover:text-gray-900 transition-colors">
                Guide
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
          <p className="text-xl text-gray-600 mb-8">
            Just add your data to Google Sheets. We turn it into beautiful invoices instantly.
            No account needed. Seriously, it's that simple.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/templates"
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              See Templates
            </Link>
            <Link
              href="#guide"
              className="px-8 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              How It Works
            </Link>
          </div>
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
            3 Steps. That's It.
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
                  Add columns for your invoice info. Invoice number, who's paying, amount, date - whatever you need.
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

      {/* Resources Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">Google Sheets Links</h3>
            <div className="space-y-4">
              <div className="p-6 border border-gray-200 rounded-xl">
                <p className="text-lg font-semibold text-gray-900 mb-2">Preview sheet</p>
                <Link
                  href="https://docs.google.com/spreadsheets/d/1CFG2-4_wD285WKL3NKCmIi4IJru2m9pIB5In0QS-jus/edit?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-900 font-medium underline underline-offset-4"
                >
                  Open in Google Sheets
                </Link>
              </div>

              <div className="p-6 border border-gray-200 rounded-xl">
                <p className="text-lg font-semibold text-gray-900 mb-2">Template table (source)</p>
                <Link
                  href="https://docs.google.com/spreadsheets/d/1CFG2-4_wD285WKL3NKCmIi4IJru2m9pIB5In0QS-jus/copy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-900 font-medium underline underline-offset-4"
                >
                  Make your own copy
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">Video walkthrough</h3>
            <div className="relative pt-[56.25%] rounded-2xl overflow-hidden shadow-lg">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dX-3886-0BM"
                title="Invoicer demo video"
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
            No credit card. No signup. Just pick a template and you're done.
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
            <p className="mb-2">© 2024 Invoicer. Simple invoice generation from Google Sheets.</p>
            <p className="text-sm">No signup required. No data stored. Privacy-first.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
