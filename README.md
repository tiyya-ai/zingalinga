# 🎬 Zinga Linga - Educational Entertainment Platform

A modern Next.js application for kids' educational content with video streaming, user management, and e-commerce features.

## ✨ Features

- 🎥 **Video Streaming** - Professional video player with speed controls
- 👤 **User Profiles** - Complete user management with avatars
- 🛒 **E-commerce** - Purchase and own video content
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - Beautiful gradients and animations
- 🔐 **Secure Authentication** - User login and session management

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub
npm run deploy
```

## 🌐 Live Demo

- **Website**: [zingalinga.io](http://zingalinga.io)
- **GitHub**: [github.com/tiyya-ai/zingalinga](https://github.com/tiyya-ai/zingalinga)

## 📦 Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Video Player**: Plyr
- **Authentication**: Custom JWT
- **Database**: Local Storage + VPS
- **Deployment**: GitHub Actions + VPS

## 🎯 Key Components

### User Dashboard
- Modern profile management
- Video library with purchase tracking
- Shopping cart and checkout
- Order history and invoices

### Video Player
- Custom controls with speed adjustment
- No download protection
- YouTube and local video support
- Professional UI design

### Admin Panel
- Content management
- User management
- Analytics and reporting

## 🛠️ Development

```bash
# Start development
npm run dev

# Build project
npm run build

# Run linting
npm run lint
```

## 📱 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Video Player
![Video Player](https://via.placeholder.com/800x400?text=Video+Player+Screenshot)

### Profile Page
![Profile](https://via.placeholder.com/800x400?text=Profile+Screenshot)

## 🚀 Deployment

### Automatic Deployment
Push to main branch triggers automatic deployment via GitHub Actions.

### Manual Deployment
```bash
# Deploy to VPS
npm run deploy-github

# Or use script
./deploy-github-to-vps.sh
```

## 📊 Project Structure

```
zingalinga/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Next.js pages
│   ├── styles/        # CSS styles
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript types
├── public/            # Static assets
├── scripts/           # Deployment scripts
└── .github/           # GitHub Actions
```

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_DOMAIN=zingalinga.io
```

### Next.js Config
```javascript
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Zinga Linga Team
- **Repository**: [tiyya-ai/zingalinga](https://github.com/tiyya-ai/zingalinga)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/tiyya-ai/zingalinga/issues)
- **Website**: [zingalinga.io](http://zingalinga.io)
- **Email**: support@zingalinga.io

---

**🎉 Made with ❤️ for kids' education**