# Family Tree Navigator

A modern, privacy-focused web application for exploring and managing your family genealogy. Built with React and designed for GEDCOM 7.0 compatibility.

![Family Tree Navigator](https://img.shields.io/badge/GEDCOM-7.0-blue) ![React](https://img.shields.io/badge/React-18.3-61dafb) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🌳 Interactive Visualization
- **Dynamic Tree View**: Navigate through generations with an intuitive, interactive family tree
- **Profile Panels**: Detailed individual profiles with comprehensive life event timelines
- **Smart Navigation**: Quick person search and relationship-based browsing

### 📊 Advanced Analytics
- **Dynasty & Cluster Analysis**: Identify family branches, noble houses, and genetic groups
- **Statistical Insights**: Comprehensive demographics, longevity analysis, and surname distribution
- **Timeline Views**: Chronological event visualization with GEDCOM 7.0 tag support

### 📝 Full GEDCOM 7.0 Support
- **Complete Attribute Coverage**: 140+ GEDCOM tags with localized labels and descriptions
- **Extended Structures**: Names (GIVN, SURN, NPFX, NSFX), Events (ASSO, ROLE), Sources, Media, Repositories
- **Round-Trip Fidelity**: Import and export without data loss

### 🎨 Beautiful Design
- **Classic Parchment Theme**: Elegant, genealogy-inspired aesthetic
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Ready**: Eye-friendly interface for extended research sessions

### 🔒 Privacy First
- **Browser-Only Processing**: All data stays on your device
- **No Server Required**: Zero data transmission to external servers
- **Session-Based**: Import, explore, and export without creating accounts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A GEDCOM file (`.ged`) of your family tree

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/familytree.git
cd familytree

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your app running.

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory, ready to deploy to any static hosting service.

## 🐳 Docker Deployment

### Quick Start with Docker Compose

The easiest way to deploy Family Tree Navigator is using Docker Compose:

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:8080`

### Building Docker Image Manually

```bash
# Build the image
docker build -t familytree:latest .

# Run the container
docker run -d -p 8080:80 --name familytree familytree:latest

# View logs
docker logs -f familytree

# Stop and remove container
docker stop familytree
docker rm familytree
```

### Production Deployment

For production deployments, consider:

1. **Using a reverse proxy** (nginx, Traefik, Caddy) for HTTPS termination
2. **Setting appropriate resource limits** in docker-compose.yml
3. **Configuring proper logging** and monitoring
4. **Regular backups** of exported GEDCOM files

Example with Traefik reverse proxy:

```yaml
services:
  familytree:
    image: familytree:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.familytree.rule=Host(`genealogy.yourdomain.com`)"
      - "traefik.http.routers.familytree.tls=true"
      - "traefik.http.routers.familytree.tls.certresolver=letsencrypt"
```

### Health Checks

The Docker container includes health checks accessible at:
- `/health` - Returns "healthy" if the service is running

### Environment Variables

Currently, the application runs entirely in the browser and doesn't require environment variables. Future cloud persistence features will add support for Firebase configuration.

## 📖 Usage

1. **Import Your GEDCOM File**
   - Click "Import" in the header
   - Select your `.ged` file
   - Choose "Lightweight" mode for browser-only operation

2. **Explore Your Tree**
   - Navigate the interactive tree visualization
   - Click on individuals to view detailed profiles
   - Use the sidebar to search and filter

3. **Analyze Your Data**
   - View statistics dashboard for demographic insights
   - Explore dynasty clusters and family branches
   - Track lineage and succession patterns

4. **Export Your Work**
   - Export to GEDCOM 7.0 format (standard)
   - Export to JSON (full project with all metadata)

## 🛠️ Technology Stack

- **Frontend**: React 18.3, Vite 6.4
- **Styling**: Vanilla CSS with CSS Variables
- **Icons**: Lucide React
- **Data Model**: GEDCOM 7.0 specification
- **State Management**: React Context API

## 📂 Project Structure

```
familytree/
├── src/
│   ├── components/        # React components
│   │   ├── Tree/         # Tree visualization
│   │   ├── Profile/      # Individual profiles
│   │   ├── Navigation/   # Sidebar and search
│   │   ├── Clustering/   # Dynasty analysis
│   │   └── Visualization/# Charts and timelines
│   ├── context/          # React context providers
│   ├── lib/
│   │   ├── gedcom/       # GEDCOM parser, exporter, models
│   │   └── analysis/     # Statistics and clustering algorithms
│   └── styles/           # CSS modules
├── data/                 # GEDCOM schema definitions
└── public/              # Static assets
```

## 🎯 Roadmap

### ✅ Current Features (v1.0 - MVP)
- GEDCOM 7.0 import/export
- Interactive tree visualization
- Profile and timeline views
- Dynasty and cluster analysis
- Statistics dashboard

### 🔜 Coming Soon
- **Cloud Persistence** (Firebase integration)
  - User authentication
  - Cross-device sync
  - Collaborative editing
- **Additional Themes**
  - Modern Minimalist
  - Organic Roots
  - Slate Professional
  - Tokyo Noir
- **Media Support**
  - Photo galleries
  - Document attachments
  - Audio/video integration
- **Advanced Features**
  - DNA integration
  - Historical maps
  - Automated research hints

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- GEDCOM 7.0 specification by FamilySearch
- React community for excellent tooling
- All genealogy enthusiasts preserving family history

## 📧 Contact

For questions, suggestions, or collaboration:
- GitHub Issues: [Report a bug or request a feature](https://github.com/yourusername/familytree/issues)
- Email: your.email@example.com

---

**Built with ❤️ for genealogy enthusiasts worldwide**
