# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

# SAP DPA POC API's

1. Create Mock Auth Token

# Request

    - POST - {{adapterbaseurl}}/mock-token

# Response

    ```{
    "mockToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJtb2NrLWlzc3VlciIsInN1YiI6Im1vY2stc3ViamVjdCIsImF1ZCI6WyJtb2NrLWF1ZGllbmNlIl0sImV4cCI6MTc1MzI2OTM2NywiaWF0IjoxNzUzMTgyOTY3LCJqdGkiOiJtb2NrLWp3dC1pZC0xNzUzMTgyOTY3MDQ0IiwiY2xpZW50X2lkIjoibW9jay1jbGllbnQiLCJzY29wZSI6WyJ1YWEucmVzb3VyY2UiXSwicHNwX2NvZGUiOiJaTVNQIn0.XVqI_JO1pXwNPl4C-hNbC4dwhY39HMZFAlidXlSDcSk"
    }```

2. Onboard Tenant

# Request

    - PUT - {{adapterbaseurl}}/core/v1/tenants/{tenantId}
    - Authorization - Bearer mockToken

# Response

    ```{
      "tenantId": "12345",
      "tenantUrl": "http://localhost:5173/core/v1/tenant/12345",
      "createdAt": "2025-07-21T12:39:41.489Z",
      "updatedAt": "2025-07-21T12:39:41.489Z"
    }```

3. Offboard Tenant

# Request

    - DELETE - {{adapterbaseurl}}/core/v1/tenants/{tenantId}
    - Authorization - Bearer mockToken

# Response - 204 No Content

3. Get Tenant

# Request

    - GET - http://localhost:5173/core/v1/tenant/12345
