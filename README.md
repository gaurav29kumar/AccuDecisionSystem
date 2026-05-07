# AccuDecisionSystem

AccuDecisionSystem is a production-grade, multi-agent reasoning platform designed to automate and optimize complex decision-making. Instead of relying on a single large language model prompt, this system routes scenarios through a structured, collaborative pipeline of specialized agents. 

The system is self-correcting: it audits its own decisions for logical flaws and hidden biases, and automatically reiterates its planning process until the final output meets strict confidence and fairness thresholds.

## 🧠 Cognitive Agent Pipeline

The architecture consists of six distinct agents that communicate through a cyclical state graph:

1. **Planner Agent**: Breaks down the input scenario and generates multiple competing strategies.
2. **Executor Agent**: Executes the selected strategy to formulate a concrete, actionable decision.
3. **Verifier Agent**: Strictly audits the decision across four dimensions: Fairness, Accuracy, Robustness, and Explainability.
4. **Bias Detector**: Scans the output for demographic assumptions, ethical issues, or logical fallacies.
5. **Reflection Agent**: Analyzes any negative feedback or bias detected to generate actionable insights.
6. **Optimizer Agent**: Translates insights into system parameters, forcing the Planner to reiterate and improve the strategy.

## ✨ Features

* **Self-Optimizing Loop**: If the Verifier's confidence drops below 85% or the Bias Detector finds severe issues, the decision is rejected and routed back through the Reflection/Optimizer loop.
* **Explainable Traceability**: All agent interactions and reasoning steps are logged in real-time, allowing human operators to audit exactly *how* and *why* a decision was made.
* **Modern Dashboard**: A highly interactive, neon-styled React interface featuring live workflow topology animations and multidimensional metric charts.

## 🛠️ Technology Stack

* **Frontend**: React, Vite, Tailwind CSS, Framer Motion (for animations), Recharts (for metrics).
* **Backend**: Python, FastAPI, WebSockets (for real-time streaming).
* **AI Orchestration**: LangGraph, LangChain.

## 🚀 Getting Started

### Prerequisites

* Python 3.10+
* Node.js 18+
* An OpenAI API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` directory and add your API key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```
5. Start the FastAPI WebSocket server:
   ```bash
   python main.py
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

## 🤝 Usage

Once both servers are running, type a complex scenario into the Chat Input panel (e.g., "Determine whether to launch the new product line despite emerging supply chain risks and shifting demographics.").

Watch the Workflow Visualizer as it highlights the active agents, and monitor the Metrics Panel as the system audits and perfects its decision.
