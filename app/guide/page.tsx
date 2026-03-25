import Link from "next/link";

export default function GuidePage() {
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
              <Link href="/templates" className="text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Google Sheets Integration Guide
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Learn how to generate professional invoices directly from your Google Sheets in minutes.
        </p>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Video walkthrough</h2>
          <p className="text-gray-600 text-center mb-6">
            Prefer to watch instead of read? This short video shows the exact setup from spreadsheet to finished invoice.
          </p>
          <div className="relative pt-[56.25%] rounded-2xl overflow-hidden shadow-lg bg-black">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/dX-3886-0BM"
              title="invoicetable demo video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        {/* Step 1 */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
              1
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Your Spreadsheet</h2>
          </div>

          <div className="ml-16 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Create a new Google Sheet with the following column headers. Each column represents a parameter that will be passed to the invoice template.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 px-3 font-bold text-gray-900">Column</th>
                    <th className="text-left py-2 px-3 font-bold text-gray-900">Description</th>
                    <th className="text-left py-2 px-3 font-bold text-gray-900">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">templateNumber</td>
                    <td className="py-3 px-3 text-gray-600">Invoice template ID (1–50)</td>
                    <td className="py-3 px-3 text-gray-700">2</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">supplier</td>
                    <td className="py-3 px-3 text-gray-600">Your company details</td>
                    <td className="py-3 px-3 text-gray-700">Acme Corp, 123 Business St, New York, NY</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">customer</td>
                    <td className="py-3 px-3 text-gray-600">Client details</td>
                    <td className="py-3 px-3 text-gray-700">Client Inc, 456 Client Ave, Boston, MA</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">issueDate</td>
                    <td className="py-3 px-3 text-gray-600">Invoice issue date</td>
                    <td className="py-3 px-3 text-gray-700">2024-01-15</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">dueDate</td>
                    <td className="py-3 px-3 text-gray-600">Payment due date</td>
                    <td className="py-3 px-3 text-gray-700">2024-02-15</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">bankAccount</td>
                    <td className="py-3 px-3 text-gray-600">
                      Bank account for payment
                      <br />
                      If you use prefix (předčíslí): use <span className="font-mono">prefix-accountNumber/XXXX</span> with exactly one '-' between prefix and account.
                    </td>
                    <td className="py-3 px-3 text-gray-700">123456789/0100</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">description</td>
                    <td className="py-3 px-3 text-gray-600">Item or service description</td>
                    <td className="py-3 px-3 text-gray-700">Web Development Services</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">quantity</td>
                    <td className="py-3 px-3 text-gray-600">Number of units</td>
                    <td className="py-3 px-3 text-gray-700">40</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">price</td>
                    <td className="py-3 px-3 text-gray-600">Price per unit</td>
                    <td className="py-3 px-3 text-gray-700">75.00</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">invoiceNumber</td>
                    <td className="py-3 px-3 text-gray-600">Unique invoice identifier (required)</td>
                    <td className="py-3 px-3 text-gray-700">INV-2024-001</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">comment</td>
                    <td className="py-3 px-3 text-gray-600">Additional notes (optional)</td>
                    <td className="py-3 px-3 text-gray-700">Thank you for your business!</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">currency</td>
                    <td className="py-3 px-3 text-gray-600">Three-letter ISO code for display/formatting</td>
                    <td className="py-3 px-3 text-gray-700">USD</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-gray-900">link</td>
                    <td className="py-3 px-3 text-gray-600">Formula output (URL to the invoice)</td>
                    <td className="py-3 px-3 text-gray-700">Generated automatically</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
              2
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Add the URL Generation Formula</h2>
          </div>

          <div className="ml-16 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              In a new column (e.g., column L), add this formula to generate invoice URLs. Replace <code className="bg-gray-100 px-2 py-1 rounded">yourdomain.com</code> with your actual domain, or use <code className="bg-gray-100 px-2 py-1 rounded">localhost:3000</code> for testing.
            </p>

            <div className="bg-gray-900 text-white p-6 rounded-lg overflow-x-auto">
              <pre className="text-sm leading-relaxed">
                <code>{`=CONCATENATE(
  "https://yourdomain.com/invoice/",$A2,
  "?invoiceNumber=",ENCODEURL($J2),
  "&supplier=",ENCODEURL($B2),
  "&customer=",ENCODEURL($C2),
  "&issueDate=",ENCODEURL($D2),
  "&dueDate=",ENCODEURL($E2),
  "&bankAccount=",ENCODEURL($F2),
  "&description=",ENCODEURL($G2),
  "&quantity=",$H2,
  "&price=",$I2,
  "&comment=",ENCODEURL($K2),
  "&currency=",ENCODEURL($L2)
)`}</code>
              </pre>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-semibold text-blue-900 mb-1">Important Note</div>
                  <div className="text-blue-800 text-sm">
                    The sample assumes columns are ordered as shown above (Template number in A, supplier in B, … currency in L, and the formula in M). Adjust the references if your sheet uses a different structure.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
              3
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Fill in Your Data</h2>
          </div>

          <div className="ml-16 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Enter your invoice data in each row. The URL formula will automatically update to generate a unique link for each invoice.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Example Row:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">templateNumber:</span>
                    <span className="text-gray-900">2</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">supplier:</span>
                    <span className="text-gray-900">Acme Corp, 123 Business St, New York, NY 10001</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">customer:</span>
                    <span className="text-gray-900">Tech Solutions Inc, 456 Tech Blvd, San Francisco, CA 94105</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">issueDate:</span>
                    <span className="text-gray-900">2024-01-15</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">dueDate:</span>
                    <span className="text-gray-900">2024-02-15</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">bankAccount:</span>
                    <span className="text-gray-900">1234567890</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">description:</span>
                    <span className="text-gray-900">Consulting Services - January 2024</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">quantity:</span>
                    <span className="text-gray-900">40</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">price:</span>
                    <span className="text-gray-900">150.00</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">invoiceNumber:</span>
                    <span className="text-gray-900">INV-2024-001</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">comment:</span>
                    <span className="text-gray-900">Payment due within 30 days. Thank you!</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-gray-600 w-40">currency:</span>
                    <span className="text-gray-900">USD</span>
                  </div>
                </div>
            </div>

          </div>
        </section>

        {/* Step 4 */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
              4
            </div>
            <h2 className="text-3xl font-bold text-gray-900">View & Download Your Invoices</h2>
          </div>

          <div className="ml-16 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Click on any generated URL to view your invoice. The invoice will be displayed in the browser with the template you selected. You can then:
            </p>

            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-3">
                <svg className="w-6 h-6 text-gray-900 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Click &quot;Download PDF&quot; to save the invoice as a PDF file</span>
              </li>
              <li className="flex gap-3">
                <svg className="w-6 h-6 text-gray-900 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Share the URL directly with clients for easy access</span>
              </li>
              <li className="flex gap-3">
                <svg className="w-6 h-6 text-gray-900 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Print the invoice directly from your browser</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Tips Section */}
        <section className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pro Tips</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Use Named Ranges</h3>
                <p className="text-gray-600 text-sm">
                  Create named ranges in Google Sheets for better formula readability and easier maintenance.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Try Different Templates</h3>
                <p className="text-gray-600 text-sm">
                  Change the template number (1-50) to see different invoice designs. Find the one that matches your brand best.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Bookmark Your Favorite Templates</h3>
                <p className="text-gray-600 text-sm">
                  Save template URLs with sample data to quickly test and preview different designs.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Automate with Apps Script</h3>
                <p className="text-gray-600 text-sm">
                  Use Google Apps Script to automatically send invoice links via email when you create new rows.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-8">
            Browse our template gallery to find the perfect design for your business.
          </p>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            View All Templates
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
