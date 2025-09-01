# Readocs

Readocs is a personal portfolio project that showcases the implementation of **LLM-powered chat** using user-provided documents (PDF, DOC, DOCX). The project explores **OpenAI LLM**, **LangChain**, **RAG (Retrieval Augmented Generation)**, and **Pinecone** as the Vector Database, wrapped in a modern **Next.js** application.

> Live Demo: [Sommaire on Vercel](https://readocs-ablahum.vercel.app)

## 🚀 Features

- Upload documents (**PDF, DOC, DOCX**) via [Uploadthing](https://uploadthing.com/).
- Generate embeddings using **OpenAI (text-embedding-3-small)**.
- Store and query embeddings in **Pinecone Vector Database**.
- Chat with **OpenAI GPT-4o-mini**, augmented with context retrieved from your documents.
- Clean UI built with **Next.js App Router** and **TypeScript**.

## 🛠️ Tech Stack
- **Frontend & Backend**: [Next.js (App Router + Server Actions)](https://nextjs.org/)
- **Language**: TypeScript
- **LLM**: [OpenAI GPT-4o-mini](https://platform.openai.com/)
- **Embeddings**: OpenAI `text-embedding-3-small`
- **Framework**: [LangChain](https://www.langchain.com/)
- **Vector DB**: [Pinecone](https://www.pinecone.io/)
- **File Upload**: [Uploadthing](https://uploadthing.com/)

## 🚀 Getting Started

## 📦 Installation
### Clone the repository
```bash
git clone https://github.com/ablahum/readocs.git
cd readocs
```

### Install dependencies
```
npm install
```

### Environment Setup
Create a `.env.local` file in the root of the project with the following keys:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cGxlYXNlZC1wYXJyb3QtNTUuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_acbOOxX5sE8Bt7qmsAAY2gc6K59tbrM6tgEvobrnZc
UPLOADTHING_TOKEN=your_uploadthing_token_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_neondb_connection_url_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
```

### Running the App
```
npm run dev
```
The app will be available at http://localhost:3000.

## 📸 Screenshots
<details>
  <summary>A glimpse of screenshots of the apps</summary>

  ### Upload page
  ![home](https://github.com/ablahum/sommaire/blob/main/public/upload.png)
  ### Ask page
  ![upload](https://github.com/ablahum/sommaire/blob/main/public/ask.png)
  ### Ask with Answer page
  ![dashboard](https://github.com/ablahum/sommaire/blob/main/public/ask-answer.png)
</details>

## 🔑 Key Highlights
- Combines RAG with OpenAI for contextual responses.
- Uses Pinecone Vector Database for efficient embedding storage and retrieval.
- Demonstrates an end-to-end workflow: upload → parse → embed → query → chat.

## 📬 Contact
For questions, suggestions:
- Email: ablahum@proton.me
- Website: https://tama-dev.vercel.app