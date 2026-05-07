import operator
from typing import Annotated, List, TypedDict, Any
from pydantic import BaseModel, Field

class VerifierScores(BaseModel):
    fairness: int = Field(description="Score from 1-10 on fairness and lack of bias")
    accuracy: int = Field(description="Score from 1-10 on factual accuracy and logic")
    robustness: int = Field(description="Score from 1-10 on handling edge cases")
    explainability: int = Field(description="Score from 1-10 on clarity of reasoning")
    overall_confidence: int = Field(description="Overall confidence score from 1-100")
    feedback: str = Field(description="Detailed feedback from the verifier")

class BiasReport(BaseModel):
    bias_detected: bool = Field(description="Whether any bias was detected")
    bias_score: int = Field(description="Severity of bias from 0-100 (higher is worse)")
    issues: List[str] = Field(description="List of specific bias issues found")
    mitigation_suggestions: List[str] = Field(description="Suggestions to mitigate bias")

class AgentState(TypedDict):
    # Input
    user_input: str
    
    # Planner
    strategies: List[str]
    selected_strategy: str
    
    # Executor
    execution_result: str
    
    # Verifier
    verifier_scores: VerifierScores | None
    
    # Bias Detection
    bias_report: BiasReport | None
    
    # Reflection & Optimization
    reflection_insights: str
    optimization_parameters: str
    
    # Meta tracking
    iteration_count: int
    messages: Annotated[list[dict], operator.add] # Append-only list of agent communications
