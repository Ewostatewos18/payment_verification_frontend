# Environment Setup Guide

## Quick Start

1. **Edit the `.env` file with your settings:**
   ```bash
   nano .env
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000/api` | Yes |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment name | `development` | No |
| `NEXT_PUBLIC_USE_MOCK_API` | Use mock API instead of real backend | `false` | No |
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout (ms) | `30000` | No |

## Configuration Examples

### Development with Local Backend
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_USE_MOCK_API=false
```

### Development with Mock API
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_USE_MOCK_API=true
```

### Production
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_ENVIRONMENT=production
```

## Troubleshooting

- **API Connection Issues**: Check if your backend is running and the URL is correct
- **CORS Errors**: Ensure your backend has CORS configured for your frontend domain
- **Timeout Errors**: Increase `NEXT_PUBLIC_API_TIMEOUT` value
- **Mock API**: Set `NEXT_PUBLIC_USE_MOCK_API=true` to test without backend
