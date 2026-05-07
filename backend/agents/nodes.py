import os
from typing import List
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from .state import AgentState, VerifierScores, BiasReport

# Load environment variables (API Key)
load_dotenv()

llm = ChatOpenAI(model="gpt-5.4-mini", temperature=0.7)

class PlannerOutput(BaseModel):
    strategies: List[str] = Field(description="List of 3 distinct strategies")
    selected_strategy: str = Field(description="The best strategy chosen from the list")

def planner_node(state: AgentState):
    print("[Planner] Analyzing input and generating strategies...")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert strategic planner. Given a scenario, generate 3 distinct strategies to approach the problem, and then select the best one."),
        ("user", "Scenario: {scenario}\nOptimization Parameters: {params}")
    ])
    
    planner_llm = llm.with_structured_output(PlannerOutput)
    chain = prompt | planner_llm
    
    params = state.get("optimization_parameters", "None")
    result = chain.invoke({"scenario": state['user_input'], "params": params})
    
    return {
        "strategies": result.strategies,
        "selected_strategy": result.selected_strategy,
        "messages": [{"agent": "Planner", "content": f"Generated {len(result.strategies)} strategies. Selected: {result.selected_strategy}"}]
    }

def executor_node(state: AgentState):
    print("[Executor] Executing strategy...")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert executor. Your job is to execute the given strategy for the user's scenario and produce a concrete, actionable decision or outcome. Keep it concise but detailed."),
        ("user", "Scenario: {scenario}\nStrategy: {strategy}")
    ])
    
    chain = prompt | llm
    
    result = chain.invoke({
        "scenario": state['user_input'],
        "strategy": state.get("selected_strategy", "")
    })
    
    return {
        "execution_result": result.content,
        "messages": [{"agent": "Executor", "content": "Executed strategy and generated actionable decision."}]
    }

def verifier_node(state: AgentState):
    print("[Verifier] Auditing the decision...")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a critical auditor. Evaluate the given decision based on the original scenario. Score it strictly from 1-10 on fairness, accuracy, robustness, and explainability. Also provide an overall confidence score (1-100) and detailed feedback on why you gave those scores."),
        ("user", "Scenario: {scenario}\nDecision: {decision}")
    ])
    
    verifier_llm = llm.with_structured_output(VerifierScores)
    chain = prompt | verifier_llm
    
    scores = chain.invoke({
        "scenario": state['user_input'],
        "decision": state.get("execution_result", "")
    })
    
    return {
        "verifier_scores": scores,
        "messages": [{"agent": "Verifier", "content": f"Audited result. Confidence score: {scores.overall_confidence}/100."}]
    }

def bias_detector_node(state: AgentState):
    print("[Bias Detector] Scanning for biases...")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert in AI ethics and bias detection. Analyze the given decision for any hidden biases, demographic assumptions, or logical flaws. Return a severity score (0-100, where higher is worse), list any specific issues, and suggest concrete mitigations. If no bias is detected, return 0 and note that."),
        ("user", "Decision: {decision}")
    ])
    
    bias_llm = llm.with_structured_output(BiasReport)
    chain = prompt | bias_llm
    
    report = chain.invoke({
        "decision": state.get("execution_result", "")
    })
    
    return {
        "bias_report": report,
        "messages": [{"agent": "Bias Detector", "content": f"Bias scan complete. Severity: {report.bias_score}/100."}]
    }

def reflection_node(state: AgentState):
    print("[Reflection] Analyzing decision shortcomings...")
    
    scores = state.get("verifier_scores")
    feedback = scores.feedback if scores else "None"
    
    report = state.get("bias_report")
    bias_issues = ", ".join(report.issues) if report and report.issues else "None"
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a reflection agent. Your job is to analyze the feedback and bias issues of the previous iteration and provide a single concise paragraph of insight on what went wrong and what must be improved."),
        ("user", "Feedback: {feedback}\nBias Issues: {bias}")
    ])
    
    chain = prompt | llm
    
    result = chain.invoke({
        "feedback": feedback,
        "bias": bias_issues
    })
    
    return {
        "reflection_insights": result.content,
        "messages": [{"agent": "Reflection", "content": "Generated insights based on feedback and bias report."}]
    }

def optimizer_node(state: AgentState):
    print("[Optimizer] Tuning execution parameters...")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an optimization agent. Based on the reflection insights, define strict new parameters or constraints that the Planner must follow in the next iteration to avoid the previous mistakes. Keep it to a concise 1-2 sentence directive."),
        ("user", "Insights: {insights}")
    ])
    
    chain = prompt | llm
    
    result = chain.invoke({
        "insights": state.get("reflection_insights", "")
    })
    
    return {
        "optimization_parameters": result.content,
        "iteration_count": state.get("iteration_count", 0) + 1,
        "messages": [{"agent": "Optimizer", "content": f"Adjusted parameters for Planner based on Reflection."}]
    }
