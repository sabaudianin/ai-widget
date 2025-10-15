# AI Widget (Vite + React + TS)

A small embeddable chat widget built with Vite + React + TypeScript.
Designed to be embedded via iframe inside a host app (e.g. Next.js) and call a server-side AI proxy (e.g. /api/ai).

# Features

React + TypeScript + Tailwind v4 (via @tailwindcss/vite)

react-hook-form + Zod validation

Toasts via sonner

AbortController (Stop request)

Simple chat UI (message bubbles, auto-scroll)

# Requirements

Node 18+ and pnpm (or npm/yarn)

A host API endpoint (e.g. http://localhost:3000/api/ai) that accepts { prompt } and returns { text }

# Quick Start

npm i
npm run dev
opens http://localhost:5173
