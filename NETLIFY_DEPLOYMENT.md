# Netlify Deployment Guide

This guide will help you deploy the AES Encryption Tool to Netlify.

## Prerequisites

1. A Netlify account (sign up at https://www.netlify.com)
2. Node.js 18+ installed locally (for building)
3. Git repository (optional, but recommended)

## Deployment Steps

### Option 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Build the project**:
   ```bash
   cd client
   npm install
   npm run build
   cd ..
   ```

4. **Initialize Netlify site** (first time only):
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Choose a site name or use the default
   - The build command is already configured in `netlify.toml`

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Option 2: Deploy via Netlify Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket** (if not already done)

2. **Go to Netlify Dashboard**:
   - Visit https://app.netlify.com
   - Click "Add new site" → "Import an existing project"

3. **Connect your repository**:
   - Select your Git provider
   - Authorize Netlify to access your repository
   - Select the repository

4. **Configure build settings** (should auto-detect from `netlify.toml`):
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`
   - **Functions directory**: `netlify/functions`

5. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

### Option 3: Deploy via Drag & Drop

1. **Build the project locally**:
   ```bash
   cd client
   npm install
   npm run build
   cd ..
   ```

2. **Go to Netlify Dashboard**:
   - Visit https://app.netlify.com
   - Drag and drop the `client/build` folder to the deploy area

   **Note**: This method won't deploy the serverless functions. Use Option 1 or 2 for full functionality.

## Configuration

The `netlify.toml` file is already configured with:

- **Build settings**: Builds the React app from `client/` directory
- **Publish directory**: `client/build`
- **Functions directory**: `netlify/functions`
- **Redirects**: 
  - `/api/*` → `/.netlify/functions/*` (API routes)
  - `/*` → `/index.html` (React Router support)

## API Endpoints

All API endpoints are available as Netlify Functions:

- `/.netlify/functions/encrypt` - Basic encryption
- `/.netlify/functions/decrypt` - Basic decryption
- `/.netlify/functions/encrypt-advanced` - Advanced encryption modes
- `/.netlify/functions/generate-key` - Generate random keys
- `/.netlify/functions/derive-key` - Key derivation (PBKDF2)
- `/.netlify/functions/password-strength` - Password strength checker
- `/.netlify/functions/calculate-hmac` - HMAC calculation
- `/.netlify/functions/upload` - File upload (convert to hex)
- `/.netlify/functions/encrypt-file` - File encryption
- `/.netlify/functions/decrypt-file` - File decryption
- `/.netlify/functions/health` - Health check

The frontend automatically uses these endpoints via the redirect rules in `netlify.toml`.

## Environment Variables

No environment variables are required for basic functionality. If you need to add any:

1. Go to Netlify Dashboard → Your Site → Site settings → Environment variables
2. Add your variables
3. Redeploy the site

## Function Limits

Netlify Functions have the following limits (free tier):

- **Execution time**: 10 seconds (26 seconds on Pro)
- **Request size**: 6 MB
- **Response size**: 6 MB
- **Memory**: 1024 MB

For larger files, consider:
- Using client-side encryption for files < 5 MB
- Implementing chunked uploads
- Using Netlify Large Media (Pro plan)

## Troubleshooting

### Build Fails

1. **Check Node.js version**: Ensure you're using Node.js 18+
2. **Clear cache**: In Netlify Dashboard → Deploys → Clear cache and retry deploy
3. **Check build logs**: Review the build output for errors

### Functions Not Working

1. **Check function logs**: Netlify Dashboard → Functions → View logs
2. **Test locally**: Use `netlify dev` to test functions locally
3. **Verify redirects**: Ensure `netlify.toml` redirects are correct

### CORS Errors

- CORS is already configured in all functions
- If you see CORS errors, check that the `Access-Control-Allow-Origin` header is set to `*`

### File Upload Issues

- File uploads now use base64 encoding (updated in frontend)
- Maximum file size is limited by Netlify's 6 MB request limit
- For larger files, consider client-side encryption

## Local Development

To test Netlify Functions locally:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev
```

This will:
- Start the React app on `http://localhost:8888`
- Run Netlify Functions locally
- Simulate the production environment

## Continuous Deployment

Once connected to Git:

- **Automatic deploys**: Every push to the main branch triggers a deploy
- **Deploy previews**: Pull requests get preview deployments
- **Branch deploys**: Deploy specific branches

## Custom Domain

1. Go to Netlify Dashboard → Your Site → Domain settings
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Performance Optimization

- **Build optimization**: Already configured in `netlify.toml`
- **CDN**: Netlify automatically uses a global CDN
- **Caching**: Static assets are cached automatically

## Support

For issues or questions:
- Netlify Docs: https://docs.netlify.com
- Netlify Community: https://community.netlify.com

## Notes

- The application uses serverless functions, so there's no persistent server
- All encryption/decryption happens server-side in the functions
- File uploads are converted to base64 for compatibility with serverless functions
- The React app is served as static files from the CDN

