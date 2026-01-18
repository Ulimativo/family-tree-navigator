# GitHub Deployment Guide

This guide explains how to deploy Family Tree Navigator to GitHub and use the included deployment configurations.

## What's Included

Your repository is now deployment-ready with the following files:

### Docker Configuration
- **Dockerfile** - Multi-stage build configuration (Node.js build + nginx serve)
- **docker-compose.yml** - Easy local/production deployment
- **nginx.conf** - Production-optimized web server configuration
- **.dockerignore** - Excludes unnecessary files from Docker builds

### CI/CD Workflows
- **.github/workflows/docker-build.yml** - Automated Docker image builds and push to GitHub Container Registry
- **.github/workflows/deploy-static.yml** - Build artifacts for static hosting (GitHub Pages ready)

### Documentation
- **DEPLOYMENT.md** - Comprehensive deployment guide for all platforms
- **README.md** - Updated with Docker deployment instructions
- **LICENSE** - MIT License

### Configuration
- **.gitignore** - Enhanced to exclude all unnecessary files from version control

## Preparing for GitHub

### 1. Clean Up Before Committing

The `.gitignore` file has been configured to exclude:
- `node_modules/` (dependencies)
- `dist/` (build output)
- `data_dev/` (personal GEDCOM files)
- IDE and OS files
- Log files and caches

Make sure you don't commit sensitive data:
```bash
# Check what will be committed
git status

# If you see unwanted files, add them to .gitignore
```

### 2. Initial Commit

If this is a new repository:
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Family Tree Navigator v1.0

- React + Vite application
- GEDCOM 7.0 import/export support
- Docker deployment configuration
- GitHub Actions CI/CD workflows"
```

### 3. Create GitHub Repository

1. Go to https://github.com/new
2. Name your repository (e.g., `familytree`)
3. Choose visibility (Public or Private)
4. **Do NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### 4. Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/yourusername/familytree.git

# Push to main branch
git branch -M main
git push -u origin main
```

## Using GitHub Actions

### Docker Image Builds

The `docker-build.yml` workflow automatically:
- Builds Docker images on every push to `main` or `develop`
- Publishes images to GitHub Container Registry (ghcr.io)
- Creates multi-architecture images (amd64, arm64)
- Tags images with version, branch, and commit SHA

**To use:**
1. Push code to GitHub
2. GitHub Actions will automatically build
3. Images will be available at `ghcr.io/yourusername/familytree`

**Pull and run your image:**
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u yourusername --password-stdin

# Pull latest image
docker pull ghcr.io/yourusername/familytree:latest

# Run container
docker run -d -p 8080:80 ghcr.io/yourusername/familytree:latest
```

### Static Site Deployment

The `deploy-static.yml` workflow builds your application for static hosting.

**To deploy to GitHub Pages:**

1. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. Uncomment the deployment job in `.github/workflows/deploy-static.yml`:
   ```yaml
   # Remove the '#' comments from the deploy section
   deploy:
     environment:
       name: github-pages
       url: ${{ steps.deployment.outputs.page_url }}
     runs-on: ubuntu-latest
     needs: build
     steps:
       - name: Deploy to GitHub Pages
         id: deployment
         uses: actions/deploy-pages@v4
   ```

3. Update `vite.config.js` if using a repository path:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     base: '/familytree/' // Use this if your repo is at github.com/user/familytree
   })
   ```

4. Push changes:
   ```bash
   git add .
   git commit -m "Enable GitHub Pages deployment"
   git push
   ```

5. Your site will be available at: `https://yourusername.github.io/familytree/`

## Local Development vs. Deployment

### Development Mode
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:5173
```

### Docker Production Mode
```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Access at http://localhost:8080
```

### Build for Static Hosting
```bash
# Build production bundle
npm run build

# The dist/ folder contains your static site
# Upload to any static hosting service
```

## Repository Structure for GitHub

```
familytree/
├── .github/
│   └── workflows/           # CI/CD automation
│       ├── docker-build.yml
│       └── deploy-static.yml
├── src/                     # Source code
├── public/                  # Static assets
├── scripts/                 # Build scripts
├── Dockerfile              # Docker build config
├── docker-compose.yml      # Docker deployment
├── nginx.conf              # Web server config
├── .dockerignore           # Docker build exclusions
├── .gitignore              # Git exclusions
├── package.json            # Node.js dependencies
├── vite.config.js          # Build configuration
├── index.html              # Entry point
├── README.md               # Project documentation
├── DEPLOYMENT.md           # Deployment guide
├── CLAUDE.md               # Development guide
├── PERSISTENCE_MIGRATION.md
├── LICENSE                 # MIT License
└── GITHUB_DEPLOYMENT_GUIDE.md  # This file
```

## Security Best Practices

1. **Never commit sensitive data:**
   - GEDCOM files with personal data
   - API keys or secrets
   - Environment variables with credentials

2. **Use GitHub Secrets for CI/CD:**
   - Go to Settings → Secrets and variables → Actions
   - Add secrets like `DOCKER_HUB_TOKEN`, `FIREBASE_CONFIG`, etc.

3. **Enable branch protection:**
   - Go to Settings → Branches
   - Add rule for `main` branch
   - Require pull request reviews
   - Require status checks to pass

4. **Keep dependencies updated:**
   ```bash
   npm audit
   npm update
   ```

## Making Your Repository Public-Ready

### Before Making Public:

1. **Review all files** for sensitive data
2. **Update README.md** with your GitHub username:
   ```bash
   # Find and replace placeholders
   sed -i 's/yourusername/your-actual-username/g' README.md DEPLOYMENT.md
   ```
3. **Test Docker build locally:**
   ```bash
   docker build -t familytree-test .
   docker run -p 8080:80 familytree-test
   ```
4. **Add repository topics** on GitHub:
   - genealogy
   - family-tree
   - gedcom
   - react
   - vite
   - docker

### After Making Public:

1. **Add a description** in repository settings
2. **Add repository URL** in `package.json`
3. **Create releases** for version tracking:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```
4. **Set up GitHub Discussions** (optional)
5. **Add a CONTRIBUTING.md** (optional)

## Deployment Options

Choose your deployment method:

| Method | Complexity | Cost | Best For |
|--------|-----------|------|----------|
| GitHub Pages | Low | Free | Public demo sites |
| Netlify/Vercel | Low | Free tier | Quick deployments |
| Docker (VPS) | Medium | $5-10/mo | Full control |
| GitHub Container Registry | Medium | Free (public) | Docker-based deployments |
| AWS S3 + CloudFront | Medium | Pay per use | Scalable hosting |

See `DEPLOYMENT.md` for detailed instructions for each method.

## Troubleshooting

### GitHub Actions failing?
- Check workflow logs in Actions tab
- Ensure Node.js version matches (20+)
- Verify `package-lock.json` is committed

### Docker build failing?
- Check Dockerfile syntax
- Ensure all files are present
- Try building locally first

### Can't push to GitHub?
```bash
# Check remote
git remote -v

# Update remote URL if needed
git remote set-url origin https://github.com/yourusername/familytree.git
```

## Next Steps

1. ✅ Push your code to GitHub
2. ✅ Verify GitHub Actions workflows run successfully
3. ✅ Choose a deployment method from DEPLOYMENT.md
4. ✅ Test your deployed application
5. ⬜ Add custom domain (optional)
6. ⬜ Set up monitoring and analytics (optional)
7. ⬜ Enable automatic updates/deployments

## Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [GitHub Container Registry](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Docker Documentation](https://docs.docker.com/)

## Support

If you encounter issues:
1. Check this guide and DEPLOYMENT.md
2. Review GitHub Actions logs
3. Check Docker logs: `docker-compose logs`
4. Search existing GitHub Issues
5. Create a new issue with details

---

**Your application is now deployment-ready! 🚀**
