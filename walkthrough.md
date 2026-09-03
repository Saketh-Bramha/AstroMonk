# AstroMonk Project Walkthrough

## What was built
A dual-engine full-stack web application designed to compute highly accurate Vedic astrological birth charts and generate deep, AI-driven cosmic insights using the Gemini 3.8/2.5 Flash models.

## Key Features
- **Vedic Mathematics Engine**: Utilizes `jyotishganit` to calculate precise planetary positions, Ascendant (Lagna), Moon Sign (Janma Rashi), and Nakshatras based on JPL ephemeris.
- **Visual Chart Generation**: Dynamically renders traditional South Indian square Kundli charts as SVGs using `jyotichart` and seamlessly embeds them into the React UI.
- **AI Oracle**: Connects directly to Google's REST API for Gemini models with a robust fallback system (`gemini-3.8-flash` -> `gemini-2.5-flash` -> `gemini-flash-latest`), ensuring high availability despite global API demand spikes.
- **Beautiful UI**: A "cosmic" themed frontend built with React, Vite, Tailwind CSS (v3), Framer Motion, and Lucide React.
- **Production Ready**: Fully deployed to the internet!

## Architecture & Deployment
- **Frontend**: React + Vite, hosted on [Vercel](https://astro-monk.vercel.app/).
- **Backend**: Python Flask, hosted on [Render](https://astromonk-api.onrender.com/). Uses `gunicorn` for production serving.
- **Version Control**: Tracked and managed via GitHub.
- **Security**: API keys are securely managed via `.gitignore` and platform environment variables.

## Validation
- Successfully tested the generation of SVGs with UTF-16 encoding handling.
- Successfully verified API fallback mechanisms during Google's 503 outage.
- Verified successful deployment and integration between the Vercel frontend and Render backend.
