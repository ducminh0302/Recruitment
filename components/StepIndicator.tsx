import React, { Dispatch } from 'react';
import { AppPhase } from '../types';
import { Action } from '../context/RecruitmentContext';

interface Step {
    phase: AppPhase;
    title: string;
}

const steps: Step[] = [
    { phase: AppPhase.JOB_DESCRIPTION, title: 'Job Description' },
    { phase: AppPhase.CV_SCANNING, title: 'CV Scanning' },
    { phase: AppPhase.SCREENING, title: 'AI Screening' },
    { phase: AppPhase.QUESTION_GENERATION, title: 'Question Generation' },
    { phase: AppPhase.INTERVIEW, title: 'AI Interview' },
    { phase: AppPhase.REPORT, title: 'Final Report' },
];

interface StepIndicatorProps {
    currentPhase: AppPhase;
    dispatch: Dispatch<Action>;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentPhase, dispatch }) => {
    const currentIndex = steps.findIndex(step => step.phase === currentPhase);

    const handleStepClick = (phase: AppPhase) => {
        dispatch({ type: 'SET_PHASE', payload: phase });
    };

    return (
        <nav aria-label="Progress">
            <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                {steps.map((step, index) => (
                    <li key={step.title} className="md:flex-1">
                        {index <= currentIndex ? (
                            <button
                                onClick={() => handleStepClick(step.phase)}
                                className="group w-full flex flex-col border-l-4 border-blue-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 hover:border-blue-700 transition-colors text-left"
                            >
                                <span className="text-sm font-medium text-blue-600">{`Step ${index + 1}`}</span>
                                <span className="text-sm font-medium text-gray-900">{step.title}</span>
                            </button>
                        ) : (
                            <div className="group flex flex-col border-l-4 border-gray-300 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 cursor-not-allowed">
                                <span className="text-sm font-medium text-gray-400">{`Step ${index + 1}`}</span>
                                <span className="text-sm font-medium text-gray-500">{step.title}</span>
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};