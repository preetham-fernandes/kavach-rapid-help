# Kavach - AI-Powered Crime Reporting & Prevention Platform

![Kavach Control Unit](https://placeholder.com/logo)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Demo](#demo)
- [Team](#team)
- [Contributing](#contributing)

## Overview

Kavach is an AI-powered, interactive crime reporting and prevention platform that bridges the gap between citizens, law enforcement, and legal bodies. Our solution enables real-time crime tracking, secure evidence handling, and intelligent law enforcement assistance. By integrating AI, blockchain, and real-time mapping, Kavach streamlines crime reporting, enhances police responsiveness, and empowers citizens with safety tools and legal awareness.

### Problem Statement

Crime reporting in India faces significant inefficiencies due to:
- Outdated systems and lack of real-time tracking
- Limited public engagement due to fear of retaliation
- Lack of awareness about legal rights
- Tedious complaint registration processes
- Unstructured data and fake complaints
- Inefficient resource allocation by law enforcement
- Absence of real-time crime mapping and predictive analytics

## Features

### For Citizens (Mobile App)
- **Quick Crime Reporting**: Report crimes instantly via voice, text, or images
- **Anonymous Reporting**: Option to report crimes with or without identity
- **Real-time Crime Map**: Live updates on crimes in your vicinity
- **Safe Route Suggestions**: AI-recommended routes to avoid high-crime areas
- **Legal Guidance**: IPC (Indian Penal Code) chatbot to understand your rights
- **SOS Functionality**: Quick alerts to emergency contacts and authorities
- **Offline Support**: Report crimes even in low-network areas
- **Emergency Mode**: Auto location sharing when battery is low

### For Law Enforcement (Admin Portal)
- **Centralized Dashboard**: Real-time complaint tracking and management
- **AI-driven Urgency Assessment**: Smart prioritization of critical cases
- **Blockchain Evidence Storage**: Tamper-proof evidence management
- **Predictive Analytics**: Crime forecasting for efficient resource allocation
- **Automated Escalation**: Ensures timely action on severe complaints

## Project Structure
```
kavach/
├── frontend/                 # Next.js web application for law enforcement
│   ├── src/                  # Source code
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   └── ...
│   │   ├── contexts/         # React contexts (Auth)
│   │   └── lib/              # Utility functions & services
│   ├── public/               # Static assets
│   └── ...
├── RNApp/                    # React Native mobile application for citizens
│   ├── src/                  # Source code
│   ├── assets/               # App assets
│   └── ...
└── README.md                 # Project documentation
```

## Technology Stack

### Frontend (Admin Portal)
- **Framework**: Next.js 14 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **State Management**: React Context API

### Mobile App (Citizen Interface)
- **Framework**: React Native
- **UI Components**: Custom components with native styling
- **Maps**: React Native Maps
- **Voice Recording**: React Native Audio Toolkit
- **Storage**: Async Storage & Secure Store

### Backend & Services
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **API Layer**: Supabase Functions & REST APIs
- **Real-time Communication**: Supabase Realtime

### Machine Learning & AI
- **LLM Integration**: Ollama Zephyr 7B, Hugging Face Transformers
- **Speech Recognition**: OpenAI Whisper, Librosa
- **Computer Vision**: YOLO, CLIP Model
- **NLP Processing**: spaCy, NLTK
- **Voice Synthesis**: ElevenLabs API

### Security
- **Authentication**: JWT with Supabase Auth
- **Evidence Storage**: Blockchain-based storage
- **Encryption**: AES-256 for sensitive data

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Frontend (Admin Portal) Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
# Create a .env.local file with the following:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run development server
npm run dev
# or
yarn dev
```

### Mobile App (RNApp) Setup
```bash
# Navigate to RNApp directory
cd RNApp

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
# Create a .env file with your configuration

# Start the development server
npm start
# or
yarn start

# Run on Android
npm run android
# or
yarn android

# Run on iOS
npm run ios
# or
yarn ios
```

## Usage

### Admin Portal
1. Access the admin portal at http://localhost:3000 (in development)
2. Log in with your admin credentials
3. View the dashboard with crime statistics and alerts
4. Manage complaint reports and evidence
5. Track SOS alerts and dispatch resources
6. Analyze crime patterns and trends

### Citizen Mobile App
1. Install the app on your mobile device
2. Register using your mobile number or email
3. Report crimes via voice, text, or images
4. View the crime map in your area
5. Use the IPC chatbot for legal assistance
6. Send SOS alerts in emergency situations

## Demo

- **Web Dashboard**: [https://v0-next-js-police-dashboard.vercel.app/](https://v0-next-js-police-dashboard.vercel.app/)
- **Demo Credentials**: Contact the development team for access

## Team

**Team InnovationNation**

- **Shashank Tiwari** - Project Manager, App Developer & Researcher
- **Joshua Dmello** - ML Specialist & LLM Enthusiast
- **Sakshi Kupekar** - App Developer
- **Preetham Fernandes** - Full Stack Developer

## Contributing

We welcome contributions to Kavach! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

---

For more information, contact the Innovation Nation team.