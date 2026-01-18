# Deployment Guide

This guide covers various deployment options for Family Tree Navigator.

## Table of Contents
- [Docker Deployment](#docker-deployment)
- [Static Hosting](#static-hosting)
- [Cloud Platforms](#cloud-platforms)
- [Self-Hosted Options](#self-hosted-options)

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+ (optional but recommended)

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/familytree.git
   cd familytree
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Open your browser to `http://localhost:8080`

4. **View logs**
   ```bash
   docker-compose logs -f familytree
   ```

5. **Stop the application**
   ```bash
   docker-compose down
   ```

### Manual Docker Build

```bash
# Build the image
docker build -t familytree:latest .

# Run the container
docker run -d \
  --name familytree \
  -p 8080:80 \
  --restart unless-stopped \
  familytree:latest

# Check container health
docker ps
docker logs familytree
```

### Production Docker Setup

For production, create a `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  familytree:
    image: familytree:latest
    container_name: familytree-prod
    ports:
      - "80:80"
    restart: always
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Deploy with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Static Hosting

Family Tree Navigator is a static single-page application that can be deployed to any static hosting service.

### Build for Production

```bash
npm install
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Netlify

1. **Via Netlify UI:**
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **netlify.toml** (optional):
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Vercel

1. **Via Vercel UI:**
   - Import your GitHub repository
   - Framework Preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Via Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **vercel.json** (optional):
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### GitHub Pages

1. **Add to package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/familytree",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

2. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Update vite.config.js:**
   ```javascript
   export default {
     base: '/familytree/'
   }
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

### AWS S3 + CloudFront

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Create S3 bucket:**
   ```bash
   aws s3 mb s3://familytree-app
   aws s3 website s3://familytree-app --index-document index.html --error-document index.html
   ```

3. **Upload files:**
   ```bash
   aws s3 sync dist/ s3://familytree-app --delete
   ```

4. **Set up CloudFront distribution** for HTTPS and caching

## Cloud Platforms

### DigitalOcean App Platform

1. Create a new app from your GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Deploy

### Render

1. Create a new Static Site
2. Connect your repository
3. Build command: `npm run build`
4. Publish directory: `dist`

### Railway

1. Create new project from GitHub repo
2. Add Dockerfile deployment
3. Configure port: 80
4. Deploy

## Self-Hosted Options

### VPS with Nginx

1. **Install Docker on your VPS:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **Clone and deploy:**
   ```bash
   git clone https://github.com/yourusername/familytree.git
   cd familytree
   docker-compose up -d
   ```

3. **Configure Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name genealogy.yourdomain.com;

       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. **Enable HTTPS with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d genealogy.yourdomain.com
   ```

### Kubernetes

Example `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: familytree
spec:
  replicas: 2
  selector:
    matchLabels:
      app: familytree
  template:
    metadata:
      labels:
        app: familytree
    spec:
      containers:
      - name: familytree
        image: familytree:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: familytree-service
spec:
  selector:
    app: familytree
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f deployment.yaml
```

## Environment Configuration

Currently, Family Tree Navigator runs entirely in the browser and doesn't require server-side environment variables. When Firebase persistence is implemented, you'll need to configure:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Monitoring and Maintenance

### Health Checks

The application exposes a health check endpoint at `/health` which returns:
- Status: 200 OK
- Response: "healthy"

### Logs

**Docker:**
```bash
docker-compose logs -f familytree
```

**Docker (standalone):**
```bash
docker logs -f familytree
```

### Updates

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Rebuild and restart:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Backup Strategy

Since the application is stateless and runs in the browser:
- No database backups needed
- Users should export their GEDCOM files regularly
- Consider implementing automatic export reminders in the UI

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **CSP Headers**: Consider adding Content Security Policy headers
3. **Rate Limiting**: Implement rate limiting on your reverse proxy
4. **Updates**: Keep Docker images and base OS updated
5. **Firewall**: Configure firewall rules (allow only 80/443)

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs familytree

# Check container status
docker ps -a

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port already in use
```bash
# Change port in docker-compose.yml
ports:
  - "8081:80"  # Use different port
```

### Build failures
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker-compose build --no-cache
```

## Performance Optimization

1. **Enable CDN** for static assets
2. **Configure browser caching** (handled by nginx.conf)
3. **Enable gzip compression** (handled by nginx.conf)
4. **Use HTTP/2** if available on your hosting platform
5. **Optimize Docker image size** (already using multi-stage build)

## Support

For deployment issues:
- Check GitHub Issues: https://github.com/yourusername/familytree/issues
- Review logs using the commands above
- Ensure you're using supported versions (Node 18+, Docker 20.10+)
