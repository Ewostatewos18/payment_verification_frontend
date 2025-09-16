# Payment Verification Frontend

A clean, modern Next.js frontend application for payment verification with real backend integration.

## Features

- **Multi-Bank Support**: Telebirr, Bank of Abyssinia (BOA), and Commercial Bank of Ethiopia (CBE)
- **Dual Input Methods**: Transaction ID entry and file upload
- **Real API Integration**: Connects to Laravel backend for actual verification
- **Mock API Support**: Optional mock mode for testing without backend
- **Responsive Design**: Modern UI with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd payment_verification_frontend
```

2. Configure environment variables:
```bash
# Edit .env with your backend URL
nano .env
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Environment Setup

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration instructions.

## Usage

1. **Select a Bank**: Choose from Telebirr, BOA, or CBE
2. **Enter Details**: 
   - For Telebirr: Enter transaction ID
   - For BOA/CBE: Enter transaction ID and account number
3. **Verify**: Click the verify button to verify with real backend
4. **View Results**: See detailed transaction information in a modal

## Backend Integration

The frontend connects to a Laravel backend API:

- **Telebirr**: `/api/telebirr/verify`
- **BOA**: `/api/boa/verify` 
- **CBE**: `/api/cbe/verify`

### Mock Mode

Set `NEXT_PUBLIC_USE_MOCK_API=true` in `.env` to use mock data instead of real API calls.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page with bank selection
│   ├── telebirr/          # Telebirr verification page
│   ├── boa/               # Bank of Abyssinia verification page
│   └── cbe/               # Commercial Bank of Ethiopia verification page
└── components/            # Reusable React components
    ├── ResultModal.tsx    # Payment verification results modal
    ├── SuccessModal.tsx   # Success state modal
    └── FailedModal.tsx    # Error state modal
```

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Customization

- **Styling**: Modify Tailwind classes in components
- **Mock Data**: Update the mock responses in each page component
- **UI Components**: Add new components in the `components/` directory
- **Pages**: Add new verification pages in the `app/` directory

## Backend Requirements

This frontend requires a Laravel backend with the following API endpoints:

- `POST /api/telebirr/verify` - Telebirr payment verification
- `POST /api/boa/verify` - BOA payment verification  
- `POST /api/cbe/verify` - CBE payment verification

See the backend repository for implementation details.

## License

This project is licensed under the MIT License.