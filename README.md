# PHORM: Prince Hall's Online Registry of Merchants

![Vercel Deploy](https://img.shields.io/github/deployments/kiel-h-byrne/phorm/production?logo=vercel&logoColor=white&label=vercel)
![Node Version](https://img.shields.io/node/v/canary)
![GitHub repo size](https://img.shields.io/github/repo-size/kiel-h-byrne/PHORM)
![Github Top Language](https://img.shields.io/github/languages/top/kiel-h-byrne/PHORM)
![GitHub Issues](https://img.shields.io/github/issues-raw/kiel-h-byrne/PHORM)
![GitHub contributors](https://img.shields.io/github/contributors/kiel-h-byrne/PHORM)
![Github Last Commit](https://img.shields.io/github/last-commit/kiel-h-byrne/PHORM)

## 🌟 Discover and Support Local Businesses Owned by PHAmily Members

<img width="80%" src="https://github.com/Kiel-H-Byrne/PHORM/assets/955269/15413aec-606d-4b9d-bc9b-c7f1d72b8b25" alt="PHORM Application Screenshot" />

PHORM is a cutting-edge, map-based business directory application designed specifically for the Prince Hall Masonic community. Our platform connects users with businesses owned by Prince Hall Freemasons, fostering economic empowerment and community support.

**[Live Demo](https://phorm.vercel.app/)** | **[Report Bug](https://github.com/Kiel-H-Byrne/PHORM/issues)** | **[Request Feature](https://github.com/Kiel-H-Byrne/PHORM/issues)**

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🔍 About The Project

PHORM (Prince Hall's Online Registry of Merchants) is a specialized business directory application that leverages modern web technologies to create a seamless, interactive experience for users seeking to discover and support businesses owned by Prince Hall Freemasons.

The application combines geospatial mapping, user authentication, and business management features to create a comprehensive platform that serves both business owners and consumers within the Prince Hall Masonic community.

### 🎯 Key Features

- **Interactive Map Interface**: Discover businesses through an intuitive Google Maps integration with custom markers and clustering
- **Advanced Search & Filtering**: Find businesses by name, category, location, and more
- **User Authentication**: Secure login via email, phone, or social providers using Firebase Authentication
- **Business Management**: Create, edit, and manage business listings with detailed information
- **User Profiles**: Customizable user profiles with membership information and class year connections
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Real-time Updates**: Instant updates to listings and user data through Firebase integration
- **Verification System**: Business verification process to ensure authenticity

## 🛠️ Technology Stack

PHORM is built with a modern, scalable technology stack:

### Frontend

- **Next.js**: React framework for server-rendered applications
- **TypeScript**: Strongly-typed JavaScript for enhanced developer experience
- **Chakra UI**: Component library for accessible, responsive UI
- **SWR**: React Hooks for data fetching with caching and revalidation
- **React Hook Form**: Performant, flexible forms with easy validation
- **Google Maps API**: Interactive mapping with custom markers and clustering
- **Framer Motion**: Animation library for enhanced user experience

### Backend & Data

- **Firebase**: Authentication, Firestore database, and cloud functions
- **Next.js API Routes**: Serverless API endpoints for data operations
- **Zod**: TypeScript-first schema validation
- **Vercel Edge Functions**: Serverless computing for API functionality

### DevOps & Tooling

- **Vercel**: Deployment platform with CI/CD integration
- **GitHub Actions**: Automated workflows for testing and deployment
- **ESLint & Prettier**: Code quality and formatting
- **Jest & React Testing Library**: Comprehensive testing suite
- **Husky & lint-staged**: Pre-commit hooks for code quality

## 🏗️ Architecture

PHORM follows a modern, component-based architecture:

```
PHORM/
├── components/        # Reusable UI components
│   ├── forms/         # Form components
│   ├── profile/       # Profile-related components
│   └── ...
├── contexts/          # React context providers
├── db/                # Database operations and schemas
├── hooks/             # Custom React hooks
├── pages/             # Next.js pages and API routes
│   ├── api/           # API endpoints
│   └── ...
├── public/            # Static assets
├── styles/            # Global styles
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

The application uses a hybrid rendering approach with:

- **Static Generation (SSG)**: For content that can be pre-rendered
- **Server-Side Rendering (SSR)**: For dynamic, personalized content
- **Client-Side Rendering**: For interactive components and real-time updates

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or Yarn
- Google Maps API key
- Firebase project

### Installation

1. Clone the repository

   ```sh
   git clone https://github.com/Kiel-H-Byrne/PHORM.git
   cd PHORM
   ```

2. Install dependencies

   ```sh
   npm install
   # or
   yarn install
   ```

3. Set up environment variables

   ```sh
   cp .env.example .env.local
   # Edit .env.local with your API keys and configuration
   ```

4. Start the development server

   ```sh
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 💻 Development Workflow

### Code Structure

- **Components**: Reusable UI elements following atomic design principles
- **Pages**: Next.js pages with data fetching and layout composition
- **API Routes**: Serverless functions for data operations
- **Contexts**: Global state management with React Context API
- **Hooks**: Custom hooks for shared logic and state management

### Styling

PHORM uses Chakra UI for component styling with:

- Theme customization for consistent branding
- Responsive design utilities
- Accessibility-first approach
- Dark/light mode support

### State Management

- **Local State**: React useState for component-level state
- **Global State**: React Context for authentication and shared state
- **Server State**: SWR for data fetching, caching, and synchronization

## 📡 API Documentation

PHORM provides a comprehensive API for data operations:

### Authentication

- `/api/auth/*`: Authentication endpoints

### Listings

- `/api/listings`: CRUD operations for business listings
- `/api/listings/[id]`: Single listing operations

### Users

- `/api/users`: User management endpoints
- `/api/users/[id]`: Single user operations
- `/api/users/class/[year]`: Class year member operations

### Connections

- `/api/connections`: User connection management

## 🧪 Testing

PHORM includes a comprehensive testing suite:

```sh
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

We use:

- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing
- **Mock Service Worker**: API mocking
- **Cypress**: End-to-end testing (planned)

## 📦 Deployment

PHORM is deployed on Vercel with:

- Automatic deployments from GitHub
- Preview deployments for pull requests
- Environment variable management
- Edge function support for API routes

## 🗺️ Roadmap

See the [TODO.md](TODO.md) file for a detailed roadmap of upcoming features and improvements.

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📬 Contact

Kiel H. Byrne - [@kielbyrne](https://twitter.com/kielbyrne)

Project Link: [https://github.com/Kiel-H-Byrne/PHORM](https://github.com/Kiel-H-Byrne/PHORM)

---

<p align="center">
  Built with ❤️ for the Prince Hall Masonic community
</p>
