import { useReducer, useCallback, useEffect, useRef } from "react";
import type { MachineState, MachineAction, FlowType } from "@/features/qualification/types";
import {
  buildQuestionFlow,
  getNextQuestion,
  getPrevQuestion,
} from "@/features/qualification/engine/conversationEngine";
import { saveSession, loadSession, clearSession } from "@/features/qualification/engine/conversationState";

function createInitialState(): MachineState {
  const persisted = loadSession();
  if (persisted) {
    const questions = buildQuestionFlow({
      flowType: persisted.flowType,
      answers: persisted.answers,
    });
    return {
      flowType: persisted.flowType,
      questions,
      currentIndex: Math.min(persisted.currentIndex, questions.length - 1),
      answers: persisted.answers,
      visited: persisted.visited,
      isComplete: false,
      isSubmitting: false,
      submitError: null,
      sessionId: persisted.sessionId,
      startedAt: persisted.startedAt,
      completedAt: null,
    };
  }

  return {
    flowType: null,
    questions: [],
    currentIndex: 0,
    answers: {},
    visited: [],
    isComplete: false,
    isSubmitting: false,
    submitError: null,
    sessionId: null,
    startedAt: null,
    completedAt: null,
  };
}

function machineReducer(state: MachineState, action: MachineAction): MachineState {
  switch (action.type) {
    case "SELECT_FLOW": {
      const questions = buildQuestionFlow({
        flowType: action.flowType,
        answers: {},
      });
      return {
        ...state,
        flowType: action.flowType,
        questions,
        currentIndex: 0,
        answers: {},
        visited: [questions[0]?.id ?? ""],
        isComplete: false,
        startedAt: new Date().toISOString(),
        sessionId: crypto.randomUUID(),
      };
    }

    case "ANSWER": {
      const newAnswers = {
        ...state.answers,
        [action.questionId]: action.value,
      };
      // Rebuild flow to apply branching based on new answer
      if (state.flowType) {
        const newQuestions = buildQuestionFlow({
          flowType: state.flowType,
          answers: newAnswers,
        });
        return {
          ...state,
          answers: newAnswers,
          questions: newQuestions,
          currentIndex: Math.min(state.currentIndex, newQuestions.length - 1),
        };
      }
      return { ...state, answers: newAnswers };
    }

    case "NEXT": {
      const result = getNextQuestion(state.questions, state.currentIndex);
      if (result.isComplete) {
        return { ...state, isComplete: true };
      }
      const visited = state.visited.includes(result.question.id)
        ? state.visited
        : [...state.visited, result.question.id];
      return {
        ...state,
        currentIndex: result.index,
        visited,
      };
    }

    case "PREV": {
      const result = getPrevQuestion(state.questions, state.currentIndex);
      return {
        ...state,
        currentIndex: result.index,
      };
    }

    case "GO_TO_QUESTION": {
      return {
        ...state,
        currentIndex: Math.min(action.index, state.questions.length - 1),
      };
    }

    case "RESUME": {
      return { ...action.state };
    }

    case "RESET": {
      clearSession();
      return createInitialState();
    }

    case "SUBMIT_START": {
      return { ...state, isSubmitting: true, submitError: null };
    }

    case "SUBMIT_DONE": {
      return {
        ...state,
        isSubmitting: false,
        isComplete: true,
        completedAt: new Date().toISOString(),
        sessionId: action.sessionId,
      };
    }

    case "SUBMIT_ERROR": {
      return { ...state, isSubmitting: false, submitError: action.error };
    }

    default:
      return state;
  }
}

export function useQualificationMachine() {
  const [state, dispatch] = useReducer(machineReducer, null, createInitialState);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.flowType && !state.isComplete) {
      const { flowType, currentIndex, answers, visited, sessionId, startedAt } = state;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveSession({
          flowType,
          currentIndex,
          answers,
          visited,
          sessionId,
          startedAt,
        });
      }, 300);
    }
    if (state.isComplete) {
      clearSession();
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.flowType, state.currentIndex, state.answers, state.visited, state.isComplete, state.sessionId, state.startedAt]);

  const selectFlow = useCallback((flowType: FlowType) => {
    dispatch({ type: "SELECT_FLOW", flowType });
  }, []);

  const answer = useCallback((questionId: string, value: unknown) => {
    dispatch({ type: "ANSWER", questionId, value });
  }, []);

  const goNext = useCallback(() => {
    dispatch({ type: "NEXT" });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: "PREV" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const submitStart = useCallback(() => {
    dispatch({ type: "SUBMIT_START" });
  }, []);

  const submitDone = useCallback((sessionId: string) => {
    dispatch({ type: "SUBMIT_DONE", sessionId });
  }, []);

  const submitError = useCallback((error: string) => {
    dispatch({ type: "SUBMIT_ERROR", error });
  }, []);

  return {
    state,
    dispatch,
    selectFlow,
    answer,
    goNext,
    goBack,
    reset,
    submitStart,
    submitDone,
    submitError,
  };
}
