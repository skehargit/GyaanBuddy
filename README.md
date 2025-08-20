# GyaanBuddy

GyaanBuddy is a personal AI knowledge assistant that allows users to upload text, PDFs, and other files, and query them using a **Retrieval-Augmented Generation (RAG)** model.
It consists of a **Client** (Vite + React + TailwindCSS) and a **Server** (Node.js with LangChain, Qdrant, and OpenAI).

---

## Project Structure

```
GyaanBuddy/
├── client/   # Frontend (Vite + React + TailwindCSS)
└── server/   # Backend (Node.js + LangChain + Qdrant + OpenAI)
```

---

## Client

The frontend is built with **Vite, React, and TailwindCSS**. It communicates with the server to send user queries and display AI responses.

### Installation

1. Navigate to the client folder:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the **client** folder:

```env
VITE_API_URL=http://localhost:5000/api
```

> Replace `http://localhost:5000` with your backend URL if deployed.

4. Start the development server:

```bash
npm run dev
```

The client will be available at `http://localhost:5173`.

---

## Server

The backend is built with **Node.js** and provides two main APIs:

* **Indexing API** – Upload and store documents in Qdrant.
* **Retrieval API** – Query stored documents using LangChain and OpenAI.

### Installation

1. Navigate to the server folder:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the **server** folder:

```env
OPENAI_API_KEY=your_openai_api_key
QDRANT_URL=https://your-qdrant-instance-url
QDRANT_API_KEY=your_qdrant_api_key
PORT=5000
```

4. Start the server:

```bash
npm start
```

The server will be available at `http://localhost:5000` (or the port you specified).

---

## Usage

1. Start the **server** first.
2. Start the **client**.
3. Open the client URL in your browser.
4. Upload your documents or text.
5. Ask questions in the chat, and GyaanBuddy will answer using RAG.

---

## Environment Variables

### Client `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### Server `.env`

```env
OPENAI_API_KEY=your_openai_api_key
QDRANT_URL=https://your-qdrant-instance-url
QDRANT_API_KEY=your_qdrant_api_key
PORT=5000
```

---

## Technologies Used

* **Frontend:** Vite, React, TailwindCSS
* **Backend:** Node.js, LangChain, Qdrant, OpenAI API
* **RAG Model:** Combines document embeddings with OpenAI for retrieval-augmented answers

---

## Notes

* Limit file uploads to reduce costs and token usage.
* Keep `.env` files secure and **do not** commit them to version control.

---

