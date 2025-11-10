# 🤖 AI Recruitment Pipeline

An intelligent recruitment platform powered by Google Gemini AI that automates the entire hiring process from job description to final candidate evaluation.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **📝 Phase 0: Job Description** - Create comprehensive job descriptions with AI assistance
- **📄 Phase 1: CV Scanning** - Automatically extract and analyze candidate information from CVs
- **🤖 Phase 2: AI Screening** - Intelligent candidate screening based on job requirements
- **❓ Phase 3: Question Generation** - Auto-generate relevant interview questions
- **💬 Phase 4: AI Interview** - Conduct AI-powered interviews with real-time responses
- **📊 Phase 5: Final Report** - Generate detailed evaluation reports with visualizations

## 🚀 Tech Stack

- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **AI Engine:** Google Gemini AI
- **Data Visualization:** Recharts
- **Styling:** Tailwind CSS
- **State Management:** React Context API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0 or higher)
- **npm** or **yarn** package manager
- **Google Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))

## 🛠️ Installation

1. **Clone the repository:**

```bash
git clone https://github.com/ducminh0302/Recruitment.git
cd ai-recruitment-pipeline
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp env.example .env
```

Open the `.env` file and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Start the development server:**

```bash
npm run dev
```

5. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build
```

The production-ready build will be generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

#### Option 1: Via Vercel Dashboard

1. Push your code to GitHub
2. Visit [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Vercel will automatically detect the Vite configuration
6. Add environment variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your Gemini API key
7. Click **"Deploy"**

Your app will be live in ~2 minutes! 🚀

#### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to your Vercel account
vercel login

# Deploy
vercel

# Add environment variable
vercel env add GEMINI_API_KEY
```

### Deploy to Other Platforms

This app can be deployed to any platform that supports static sites:

- **Netlify**: Connect your GitHub repo and set build command to `npm run build`
- **AWS Amplify**: Import from GitHub with build settings
- **GitHub Pages**: Use `gh-pages` branch for deployment

**Important:** Always set the `GEMINI_API_KEY` environment variable in your deployment platform.

## 📁 Project Structure

```
ai-recruitment-pipeline/
├── components/
│   ├── phases/
│   │   ├── Phase0_JobDescription.tsx
│   │   ├── Phase1_CVScanner.tsx
│   │   ├── Phase2_AIScreening.tsx
│   │   ├── Phase3_QuestionGeneration.tsx
│   │   ├── Phase4_AIInterview.tsx
│   │   └── Phase5_Report.tsx
│   ├── icons.tsx
│   ├── Loader.tsx
│   └── StepIndicator.tsx
├── context/
│   └── RecruitmentContext.tsx
├── services/
│   └── geminiService.ts
├── App.tsx
├── index.tsx
├── types.ts
└── vite.config.ts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | ✅ Yes |

### Vite Configuration

The project uses a custom Vite configuration (`vite.config.ts`) that:
- Serves on port 3000
- Exposes the server on `0.0.0.0` for network access
- Injects environment variables at build time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Powered by [Google Gemini AI](https://ai.google.dev/)
- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ using Google Gemini AI
