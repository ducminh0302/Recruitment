import React, { createContext, useReducer, useContext, Dispatch } from 'react';
import { AppPhase, JobDescription, Candidate } from '../types';

interface AppState {
    currentPhase: AppPhase;
    jobDescription: JobDescription | null;
    candidates: Candidate[];
    selectedCandidateId: string | null;
}

export type Action =
    | { type: 'SET_PHASE'; payload: AppPhase }
    | { type: 'SET_JOB_DESCRIPTION'; payload: JobDescription }
    | { type: 'SET_CANDIDATES'; payload: Candidate[] }
    | { type: 'UPDATE_CANDIDATE'; payload: Candidate }
    | { type: 'SET_SELECTED_CANDIDATE'; payload: string | null }
    | { type: 'RESET_STATE' };

const initialState: AppState = {
    currentPhase: AppPhase.JOB_DESCRIPTION,
    jobDescription: null,
    candidates: [],
    selectedCandidateId: null,
};

const RecruitmentContext = createContext<{
    state: AppState;
    dispatch: Dispatch<Action>;
}>({
    state: initialState,
    dispatch: () => null,
});

const recruitmentReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_PHASE':
            return { ...state, currentPhase: action.payload };
        case 'SET_JOB_DESCRIPTION':
            return { ...state, jobDescription: action.payload };
        case 'SET_CANDIDATES':
            return { ...state, candidates: action.payload };
        case 'UPDATE_CANDIDATE':
            return {
                ...state,
                candidates: state.candidates.map(c =>
                    c.id === action.payload.id ? action.payload : c
                ),
            };
        case 'SET_SELECTED_CANDIDATE':
            return { ...state, selectedCandidateId: action.payload };
        case 'RESET_STATE':
            return initialState;
        default:
            return state;
    }
};

export const RecruitmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(recruitmentReducer, initialState);
    return (
        <RecruitmentContext.Provider value={{ state, dispatch }}>
            {children}
        </RecruitmentContext.Provider>
    );
};

export const useRecruitmentContext = () => useContext(RecruitmentContext);