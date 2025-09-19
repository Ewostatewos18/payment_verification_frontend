# Payment Verification Frontend

A modern Next.js application for verifying payments from Ethiopian banks and mobile money services.

## Features

- **Multi-Bank Support**: Telebirr, Bank of Abyssinia (BOA), Commercial Bank of Ethiopia (CBE)
- **Multiple Input Methods**: Transaction ID entry, file upload, and camera capture
- **Real-time Verification**: Connects to Laravel backend API
- **Responsive Design**: Works on all devices
- **TypeScript**: Full type safety

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000/api` |
| `NEXT_PUBLIC_USE_MOCK_API` | Use mock API | `false` |
| `NEXT_PUBLIC_API_TIMEOUT` | Request timeout (ms) | `30000` |

## Usage

1. **Select Bank**: Choose Telebirr, BOA, or CBE
2. **Enter Details**: 
   - Transaction ID (required for all)
   - Account number (required for BOA/CBE)
3. **Upload Method**: Choose file upload or camera capture
4. **Verify**: Submit for real-time verification

## API Endpoints

- `POST /api/telebirr/verify` - Telebirr verification
- `POST /api/boa/verify` - BOA verification  
- `POST /api/cbe/verify` - CBE verification
- `POST /api/image/{bank}/verify` - Image-based verification

## Tech Stack

- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Camera**: react-webcam
- **HTTP Client**: Axios

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/                    # Pages
│   ├── page.tsx           # Home page
│   ├── telebirr/          # Telebirr verification
│   ├── boa/               # BOA verification
│   └── cbe/               # CBE verification
├── components/             # React components
│   ├── modals/            # Modal components
│   └── ResultModal.tsx    # Main result modal
├── lib/                   # Utilities
│   ├── api.ts             # API client
│   └── errorHandler.ts    # Error handling
└── types/                 # TypeScript definitions
    └── verification.ts
```

## License

MIT License