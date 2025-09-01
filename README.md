# Loubie Designs

I built this website to feature the work of my talented wife and her business, Loubie Designs. Deployed using [AWS Amplify](https://aws.amazon.com/getting-started/hands-on/host-static-website/?trk=8d132519-1c91-4e54-990a-95df61212b6f&sc_channel=em&mkt_tok=MTEyLVRaTS03NjYAAAGaK11zNBPeej3qD3xLqKz6VVsp0AvQSsjJ-kDlMVms0j8yzVDuHxpf5ez8TWXHEf2DFgp-GeOqIKBNaMrnRo2tKIKR8vLH_d6U-s7yt9dSZjGzZqRq3ogGwg).

![React](https://img.shields.io/badge/React-19.1.0-blue) ![Vite](https://img.shields.io/badge/Vite-7.0.4-green) ![Node](https://img.shields.io/badge/Node-22.12.0-brightgreen)

Visit the live website: [Loubie Designs](https://www.loubie-designs.com)

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0 with React Router DOM 7.7.0
- **Build Tool**: Vite 7.0.4 with Hot Module Replacement
- **Styling**: CSS3 with custom properties and responsive design
- **Cloud Services**: AWS DynamoDB, CloudFront CDN, AWS Amplify
- **Node Version**: 22.12.0 (managed via .nvmrc)

## 🏗️ Architecture

The application uses a modern cloud-native architecture:
- **React frontend** for the user interface
- **AWS DynamoDB** for product metadata storage
- **AWS CloudFront CDN** for optimized image delivery
- **AWS Amplify** for continuous deployment

## 📁 Project Structure

```
loubie_designs/
├── public/
│   ├── photos/          # Static images
│   └── logos/           # Brand assets
├── src/
│   ├── components/
│   │   ├── Navigation.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   └── Portfolio.jsx    # Main gallery with AWS integration
│   ├── services/
│   │   └── awsService.js    # AWS SDK integration
│   ├── styles/              # Component-specific CSS
│   └── main.jsx
├── amplify.yml             # AWS Amplify build config
└── package.json            # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22.12.0 (use nvm: `nvm use`)
- AWS credentials (for development)

### Development Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/rhettbarton/loubie_designs.git
   cd loubie_designs
   nvm use                  # Switch to Node 22.12.0
   npm ci                   # Install dependencies
   ```

2. **Configure AWS (for full functionality)**
   ```bash
   # Create local environment file with AWS credentials
   bash create-local-dev-env.sh
   ```

3. **Start development server**
   ```bash
   npm run dev             # Starts on http://localhost:5173
   ```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## ☁️ AWS Integration

The application integrates with several AWS services:

- **DynamoDB**: Stores product metadata including image file lists
- **CloudFront CDN**: Delivers images with global edge caching
- **Amplify**: Handles continuous deployment from Git

### Environment Variables
- `VITE_AWS_REGION`: AWS region (default: us-west-2)
- `VITE_DYNAMO_TABLE_NAME`: DynamoDB table name
- `VITE_PHOTO_CDN_DOMAIN`: CloudFront distribution domain
- `VITE_AWS_ACCESS_KEY_ID`: AWS access key (development only)
- `VITE_AWS_SECRET_ACCESS_KEY`: AWS secret key (development only)
- `VITE_AWS_SESSION_TOKEN`: AWS session token (development only)

## 🎨 Design System

### Color Palette
- **Primary**: `#2c2c2c` (Dark charcoal)
- **Secondary**: `#6b7280` (Warm gray)
- **Accent**: `#d4af37` (Gold)
- **Background**: `#fafaf9` (Off-white)

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- Fully responsive with fluid scaling

## 📊 Content Management

Products are managed through DynamoDB with the following structure:

```json
{
  "id": "unique-product-id",
  "name": "Product Name",
  "description": "Detailed description",
  "category": "Product Category",
  "folderPath": "Category/Product Name",
  "coverImage": "main-image.jpg",
  "featured": "true",
  "portfolio": "true",
  "files": [
    "image1.jpg",
    "image2.jpg",
    "image3.jpg"
  ]
}
```

### Adding New Products
1. Upload images to the appropriate folder structure
2. Add product metadata to DynamoDB
3. The application automatically generates CDN URLs from the file list

## 🚀 Deployment

### Automatic Deployment
- Push to `prod` branch triggers AWS Amplify build
- Build uses Node.js 22.12.0 as specified in `amplify.yml`
- Environment variables are managed through Amplify Console and can be configured from the CLI using this script:

```bash
# Configure production environment variables
bash set-app-env-vars.sh
```

### Deployment Branches
- `prod`: Production deployment
- `stage`: Staging environment
- Feature branches: Local development

## 🛠️ Development Tools

### Dependency Management
```bash
# Preview dependency changes
node sync-dependencies.js --dry-run

# Apply dependency cleanup
node sync-dependencies.js
```

### AWS Credential Management
```bash
# Create local development environment
bash create-local-dev-env.sh

# Configure production app environment
bash set-app-env-vars.sh
```

## 🐛 Troubleshooting

### Common Issues

**AWS Connection Errors**
- Ensure `.env.local` exists with valid credentials
- Check AWS SSO session: `aws sso login --profile loubie`
- Verify environment variables are set with `VITE_` prefix

**Build Errors**
- Clear node_modules: `rm -rf node_modules && npm ci`
- Check Node version: `nvm use`
- Verify Amplify build logs for deployment issues

**Image Loading Issues**
- Check CloudFront CDN domain configuration
- Verify DynamoDB file lists match actual uploaded images

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request targeting `stage`
6. After changes have been tested in `stage`, open a Pull Request targeting `prod` 

## 📄 License

This project is private and proprietary. All rights reserved by Loubie Designs.

---

**Built with ❤️ for Loubie Designs**