# invoicetable - Professional Invoice Generator

Generate beautiful, professional invoices directly from Google Sheets. Choose from 50 customizable templates with no signup required.

## Features

- 🚀 **Lightning Fast** - Generate invoices instantly from URL parameters
- 🎨 **50 Templates** - Professional designs for every business style
- 📊 **Google Sheets Integration** - Manage all invoices in a spreadsheet
- 📄 **PDF Export** - Download invoices as PDF with one click
- 🔒 **Privacy First** - No data stored, no signup required
- 🌐 **Modern Stack** - Built with Next.js 15, TypeScript, and Tailwind CSS

## Getting Started

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Production Build

```bash
npm run build
npm start
```

## Invoice Parameters

All templates accept the following URL parameters:

| Parameter | Description | Required | Example |
|-----------|-------------|----------|---------|
| `template` | Template ID (1-50) | Yes | 1 |
| `invoiceNumber` | Unique invoice identifier | Yes | INV-2024-001 |
| `supplier` | Your company details | Yes | Acme Corp, 123 Business St |
| `customer` | Client details | Yes | Client Inc, 456 Client Ave |
| `issueDate` | Invoice issue date | Yes | 2024-01-15 |
| `dueDate` | Payment due date | Yes | 2024-02-15 |
| `bankAccount` | Bank account for payment | Yes | 123456789/0100 |
| `description` | Item or service description | Yes | Consulting Services |
| `quantity` | Number of units | Yes | 40 |
| `price` | Price per unit | Yes | 150.00 |
| `comment` | Additional notes | No | Thank you for your business! |

## Czech QR Payment (SPAYD)

- `ACC` is always generated as a Czech IBAN (`CZ...`) to stay compliant with SPAYD.
- Local account formats are automatically converted to IBAN:
  - `prefix-account/bankCode` (for example `7720-77628031/0710`)
  - `account/bankCode` (for example `77628031/0710`)
  - `prefix-account` + separate `bank_code` (for API route)
- Variable symbol is encoded as `X-VS` (Czech extension key).
- Messages are sanitized for SPAYD (single line, without `*`, max 60 chars).

## Google Sheets Integration

### Step 1: Create Your Spreadsheet

Create columns for all parameters listed above plus one for the template number.

### Step 2: Add URL Generation Formula

Use this formula to generate invoice URLs (adjust cell references as needed):

```
=CONCATENATE(
  "https://yourdomain.com/invoice/",K2,
  "?invoiceNumber=",ENCODEURL(A2),
  "&supplier=",ENCODEURL(B2),
  "&customer=",ENCODEURL(C2),
  "&issueDate=",ENCODEURL(D2),
  "&dueDate=",ENCODEURL(E2),
  "&bankAccount=",ENCODEURL(F2),
  "&description=",ENCODEURL(G2),
  "&quantity=",H2,
  "&price=",I2,
  "&comment=",ENCODEURL(J2)
)
```

For detailed instructions, visit [http://localhost:3000/guide](http://localhost:3000/guide) when running locally.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Deploy with one click
4. Your app will be live at `https://your-app.vercel.app`

### Deploy to Your Own Server

1. Build the production version:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Configure your web server (nginx, Apache) to proxy requests to the Next.js server

## Template Variations

The app includes 50 templates with 4 distinct layout styles:

- **Modern Layout** (Templates: 4, 8, 12, 16...)
- **Classic Layout** (Templates: 1, 5, 9, 13...)
- **Minimal Layout** (Templates: 2, 6, 10, 14...)
- **Bold Layout** (Templates: 3, 7, 11, 15...)

Each template features unique color schemes and typography.

## Project Structure

```
invoicer-nextjs/
├── app/
│   ├── guide/              # Google Sheets integration guide
│   ├── templates/          # Template gallery
│   ├── invoice/[templateId]/  # Dynamic invoice pages
│   ├── page.tsx            # Landing page
│   └── layout.tsx          # Root layout
├── types/
│   ├── invoice.ts          # TypeScript interfaces
│   └── html2pdf.d.ts       # PDF library types
└── public/                 # Static assets
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **PDF Generation:** html2pdf.js
- **Deployment:** Vercel (recommended)

## License

MIT

## Support

For issues and questions, please visit [http://localhost:3000/guide](http://localhost:3000/guide)
