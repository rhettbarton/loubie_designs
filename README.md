# Loubie Designs

I built this website to feature the work of my talented wife and her business, Loubie Designs. Built by vibe coding with [Claude](https://claude.ai) Sonnet 4 and deployed on [AWS Amplify](https://aws.amazon.com/getting-started/hands-on/host-static-website/?trk=8d132519-1c91-4e54-990a-95df61212b6f&sc_channel=em&mkt_tok=MTEyLVRaTS03NjYAAAGaK11zNBPeej3qD3xLqKz6VVsp0AvQSsjJ-kDlMVms0j8yzVDuHxpf5ez8TWXHEf2DFgp-GeOqIKBNaMrnRo2tKIKR8vLH_d6U-s7yt9dSZjGzZqRq3ogGwg).

![React](https://img.shields.io/badge/React-19.1.0-blue) ![Vite](https://img.shields.io/badge/Vite-7.0.4-green) ![Node](https://img.shields.io/badge/Node-22.12.0-brightgreen)

Visit the live website: [Loubie Designs](https://www.loubie-designs.com)

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Routing**: React Router DOM 7.7.0
- **Styling**: CSS3 with Custom Properties
- **Deployment**: AWS Amplify
- **Node Version**: 22.12.0 (managed with .nvmrc)

## 📁 Project Structure

```
loubie_designs/
├── public/
│   ├── photos/           # Product images
│   └── logos/           # Brand logos
├── src/
│   ├── components/
│   │   ├── Navigation.jsx   # Main navigation component
│   │   └── Footer.jsx      # Footer with contact links
│   ├── pages/
│   │   ├── Home.jsx     # Landing page
│   │   ├── About.jsx    # About Lauren page
│   │   └── Portfolio.jsx # Product gallery
│   ├── styles/          # Page-specific CSS files
│   ├── data/
│   │   └── photos.json  # Product metadata
│   ├── App.jsx          # Main app component
│   └── main.jsx         # React entry point
├── amplify.yml          # AWS Amplify build configuration
└── package.json         # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites

- Node.js 22.12.0 (use `.nvmrc` for version management)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rhettbarton/loubie_designs.git
   cd loubie_designs
   ```

2. **Use the correct Node version**
   ```bash
   nvm use
   # or nvm install 22.12.0 if not already installed
   ```

3. **Install dependencies**
   ```bash
   npm ci
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```bash
   http://localhost:5173
   # or whatever port ends up being used
   ```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## 🎨 Design System

### Color Palette
```css
--primary-color: #2c2c2c     /* Dark charcoal */
--secondary-color: #6b7280   /* Warm gray */
--accent-color: #d4af37      /* Gold accent */
--background-primary: #fafaf9 /* Off-white */
--text-primary: #1f2937      /* Dark gray */
```

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Responsive**: Fluid scaling across all devices


## 📊 Content Management

### Adding New Products

1. **Add photos** to `public/photos/` in organized subdirectories
2. **Update** `src/data/photos.json`:
   ```json
   {
     "id": "unique-product-id",
     "name": "Product Name",
     "description": "Detailed product description",
     "category": "Product Category",
     "coverImage": "Category/Product Name/main-image.jpg",
     "featured": true,
     "portfolio": true,
     "images": [
       {
         "file": "Category/Product Name/image1.jpg",
         "label": "Image Label",
         "description": "Image description"
       }
     ]
   }
   ```

### Product Data Structure
- `id`: Unique identifier for the product (kebab-case)
- `name`: Display name for the product
- `description`: Detailed product description
- `category`: Used for filtering (Baby Quilts, Table Runners, Placemats, etc.)
- `coverImage`: Main product image shown in grid
- `featured`: Show in featured reel (boolean)
- `portfolio`: Include in main portfolio grid (boolean)
- `images`: Array of product images with individual labels and descriptions

## 🚀 Deployment

This project is configured for AWS Amplify deployment:

- Push to `prod` branch triggers automatic build and deployment
- Build configuration in `amplify.yml`
- Node version locked to 22.12.0 for consistency


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request targeting `stage`
6. After changes have been tested in `stage`, open a Pull Request targeting `prod` 


# Connecting to AWS Resources

## (Stage/Prod) Set environment variables
```bash
bash set-app-env-vars.sh
```

## (Local Dev) Create Local Environment File
Create a .env.local file in your project root:

```bash
bash create-local-dev-env.sh
```

## 📄 License

This project is private and proprietary. All rights reserved by Loubie Designs.

## 📧 Support

For technical issues or questions, create an issue in this repository.

---

**Built with ❤️ for Loubie Designs**