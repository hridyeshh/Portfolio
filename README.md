# Hridyesh Kumar - Personal Portfolio

A modern, responsive personal portfolio website showcasing software development expertise, projects, and professional experience. Built with cutting-edge web technologies and featuring smooth animations, custom cursor effects, and an elegant dark/light theme system.

## 🚀 Features

- **Dynamic Theme System**: Seamless transitions between light and dark modes based on scroll position
- **Custom Cursor Effects**: Google Design-inspired cursor with blend modes and smooth animations
- **Smooth Scroll Navigation**: Fluid section transitions with intersection observer animations
- **Responsive Design**: Optimized for all device sizes from mobile to desktop
- **Interactive Animations**: 
  - Fade-in effects for content sections
  - Parallax background scaling in hero section
  - Hover states with transform animations
  - Back-to-top button with smart visibility
- **Performance Optimized**: 
  - CSS animations using `transform` and `opacity` for 60fps performance
  - Efficient scroll event handling with requestAnimationFrame
  - Optimized image loading and rendering

## 📦 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with CSS Grid, Flexbox, and CSS Custom Properties
- **Animations**: CSS Transitions, Keyframe Animations, Intersection Observer API
- **Typography**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- **Icons**: Custom CSS shapes and transforms
- **Performance**: RequestAnimationFrame for smooth cursor tracking

## 🛠️ Installation & Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/hridyeshh/portfolio.git
cd portfolio
```

2. Option A - Direct file access:
```bash
# Simply open index.html in your browser
open index.html
```

3. Option B - Local development server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using Live Server (VS Code extension)
# Right-click index.html → "Open with Live Server"
```

4. Navigate to `http://localhost:8000` (if using local server)

## 📖 Usage

### Navigation

The portfolio features smooth scroll navigation with the following sections:

- **Home**: Hero section with introduction and call-to-action buttons
- **About**: Personal background, interests, and professional philosophy
- **Experience**: Detailed work history with internship experiences
- **Projects**: Showcase of technical projects with live demos and source code
- **Skills**: Comprehensive overview of technical competencies
- **Contact**: Professional contact information and resume download

### Interactive Features

- **Custom Cursor**: Follows mouse movement with smooth easing and blend mode effects
- **Theme Switching**: Automatic theme changes based on scroll position and section context
- **Project Cards**: Hover effects with background color inversions and transform animations
- **Skill Categories**: Interactive hover states with color transitions
- **Back to Top**: Smart visibility button appearing from About section onward

## 📁 Project Structure

```
portfolio/
├── index.html              # Main HTML structure
├── styles.css             # Complete styling and animations
├── script.js              # Interactive functionality and animations
├── README.md              # Project documentation
├── assets/
│   ├── IMG_7861 4.JPG     # Profile image
│   ├── creation.png       # Hero background image
│   ├── connect.png        # Contact section image
│   └── hridyesh_resume.pdf # Resume download
└── fonts/                 # Custom fonts (if any)
```

## ⚙️ Customization

### Color Scheme

The portfolio uses a dynamic color system with CSS custom properties:

```css
:root {
    --transition-duration: 0.6s;
}

/* Light theme (default) */
body.bg-white {
    background-color: #fff;
    color: #000;
}

/* Dark theme */
body.bg-black {
    background-color: #000;
    color: #fff;
}
```

### Animation Settings

Customize animation timings and effects:

```css
/* Smooth cursor following speed */
cursorX += dx * 0.2; // Adjust for cursor responsiveness

/* Scroll animation threshold */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};
```

### Content Updates

1. **Personal Information**: Update content in `index.html`
2. **Project Showcase**: Modify the projects grid with new project cards
3. **Experience Timeline**: Add new positions in the experience section
4. **Skills Matrix**: Update skill categories and technologies
5. **Contact Information**: Modify links and contact methods

## 🎨 Design Principles

- **Minimalist Aesthetic**: Clean typography and generous white space
- **Accessibility First**: High contrast ratios and semantic HTML structure
- **Performance Oriented**: Optimized animations and efficient resource loading
- **Mobile Responsive**: Touch-friendly interactions and adaptive layouts
- **Professional Branding**: Consistent visual hierarchy and color usage

## 🔧 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (limited support, some animations may not work)

## 📊 Performance Metrics

- **Lighthouse Score**: 95+ Performance, 100 Accessibility
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **Mobile Responsiveness**: Fully optimized

## 🚀 Deployment

### GitHub Pages
```bash
# Enable GitHub Pages in repository settings
# Choose source: Deploy from a branch → main
# Site will be available at: https://yourusername.github.io/portfolio
```

### Netlify
```bash
# Connect repository to Netlify
# Build settings: 
#   - Build command: (leave empty)
#   - Publish directory: /
```

### Vercel
```bash
# Import repository to Vercel
# Framework preset: Other
# Build and output settings: Default
```


## 📞 Contact

**Hridyesh Kumar**
- 📧 Email: hridyesh2309@gmail.com
- 🔗 LinkedIn: [linkedin.com/in/hridyeshh](https://www.linkedin.com/in/hridyeshh/)
- 💻 GitHub: [github.com/hridyeshh](https://github.com/hridyeshh)
- 📄 Resume: [Download PDF](hridyesh_resume.pdf)

---

*"Great knowledge often comes from the humblest of origins."*

Built with ❤️ by Hridyesh Kumar
