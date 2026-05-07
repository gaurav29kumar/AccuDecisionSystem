from langgraph.graph import StateGraph, END
from typing import Literal

from .state import AgentState
from .nodes import (
    planner_node,
    executor_node,
    verifier_node,
    bias_detector_node,
    reflection_node,
    optimizer_node
)

# Define the routing logic
def should_optimize(state: AgentState) -> Literal["optimize", "end"]:
    """Determines whether the decision is good enough or needs optimization."""
    scores = state.get("verifier_scores")
    bias = state.get("bias_report")
    iterations = state.get("iteration_count", 0)
    
    # Max 3 iterations to prevent infinite loops
    if iterations >= 2:
        print("[Router] Max iterations reached. Ending.")
        return "end"
        
    if scores and bias:
        confidence = scores.overall_confidence
        bias_score = bias.bias_score
        
        # Require 85% confidence and less than 20% bias score
        if confidence < 85 or bias_score > 20:
            print(f"[Router] Confidence ({confidence}) too low or bias ({bias_score}) too high. Optimizing.")
            return "optimize"
            
    print("[Router] Decision meets threshold. Ending.")
    return "end"

# Build the graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("planner", planner_node)
workflow.add_node("executor", executor_node)
workflow.add_node("verifier", verifier_node)
workflow.add_node("bias_detector", bias_detector_node)
workflow.add_node("reflection", reflection_node)
workflow.add_node("optimizer", optimizer_node)

# Set entry point
workflow.set_entry_point("planner")

# Add edges
workflow.add_edge("planner", "executor")

# After execution, run verifier and bias detector in parallel
# (In LangGraph, we execute them sequentially in this simple setup, 
# but conceptually they audit the same execution result)
workflow.add_edge("executor", "verifier")
workflow.add_edge("verifier", "bias_detector")

# Conditional routing after bias detection
workflow.add_conditional_edges(
    "bias_detector",
    should_optimize,
    {
        "optimize": "reflection",
        "end": END
    }
)

# Optimization loop edges
workflow.add_edge("reflection", "optimizer")
workflow.add_edge("optimizer", "planner")

# Compile the graph
app = workflow.compile()
