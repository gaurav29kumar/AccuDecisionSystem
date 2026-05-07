import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.graph import app as agent_app

app = FastAPI(title="Cognitive Agent System API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

class ScenarioInput(BaseModel):
    scenario: str

@app.post("/api/run")
async def run_scenario_sync(input_data: ScenarioInput):
    """Fallback synchronous endpoint if WS isn't used."""
    initial_state = {"user_input": input_data.scenario, "iteration_count": 0, "messages": []}
    result = agent_app.invoke(initial_state)
    return result

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for a message from the client
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            scenario = payload.get("scenario")
            if not scenario:
                await websocket.send_json({"type": "error", "message": "No scenario provided"})
                continue
                
            await websocket.send_json({"type": "status", "message": f"Starting analysis for: '{scenario[:20]}...'"})
            
            initial_state = {
                "user_input": scenario,
                "iteration_count": 0,
                "messages": [],
                "strategies": [],
                "selected_strategy": "",
                "execution_result": "",
                "verifier_scores": None,
                "bias_report": None,
                "reflection_insights": "",
                "optimization_parameters": ""
            }
            
            # Stream events from LangGraph
            try:
                # Use .astream for async streaming
                # We yield state updates after every node execution
                async for event in agent_app.astream(initial_state):
                    # event is a dict where key is node name and value is the state update
                    for node_name, state_update in event.items():
                        
                        # We extract only the relevant bits to send to frontend to save bandwidth
                        # Pydantic models need to be dumped to dicts
                        serializable_update = {}
                        
                        for k, v in state_update.items():
                            if k == "verifier_scores" and v is not None:
                                serializable_update[k] = v.model_dump()
                            elif k == "bias_report" and v is not None:
                                serializable_update[k] = v.model_dump()
                            elif k != "messages": # We handle messages separately or just send them
                                serializable_update[k] = v
                        
                        # Get the latest message if any
                        messages = state_update.get("messages", [])
                        latest_msg = messages[-1] if messages else None
                                
                        await websocket.send_json({
                            "type": "node_update",
                            "node": node_name,
                            "state_delta": serializable_update,
                            "latest_message": latest_msg
                        })
                        
                        # Add a small artificial delay so the UI animation looks good
                        await asyncio.sleep(1.5)
                        
                await websocket.send_json({"type": "complete", "message": "Workflow finished"})
                
            except Exception as e:
                print(f"Error in graph execution: {e}")
                await websocket.send_json({"type": "error", "message": str(e)})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
