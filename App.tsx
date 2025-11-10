import React from 'react';
import { RecruitmentProvider, useRecruitmentContext } from './context/RecruitmentContext';
import Phase0_JobDescription from './components/phases/Phase0_JobDescription';
import Phase1_CVScanner from './components/phases/Phase1_CVScanner';
import Phase2_AIScreening from './components/phases/Phase2_AIScreening';
import Phase3_QuestionGeneration from './components/phases/Phase3_QuestionGeneration';
import Phase4_AIInterview from './components/phases/Phase4_AIInterview';
import Phase5_Report from './components/phases/Phase5_Report';
import { StepIndicator } from './components/StepIndicator';
import { AppPhase } from './types';

const AppContent: React.FC = () => {
    const { state, dispatch } = useRecruitmentContext();

    const renderPhase = () => {
        switch (state.currentPhase) {
            case AppPhase.JOB_DESCRIPTION:
                return <Phase0_JobDescription />;
            case AppPhase.CV_SCANNING:
                return <Phase1_CVScanner />;
            case AppPhase.SCREENING:
                return <Phase2_AIScreening />;
            case AppPhase.QUESTION_GENERATION:
                return <Phase3_QuestionGeneration />;
            case AppPhase.INTERVIEW:
                return <Phase4_AIInterview />;
            case AppPhase.REPORT:
                return <Phase5_Report />;
            default:
                return <Phase0_JobDescription />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
            <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-16">
                         <h1 className="text-xl md:text-2xl font-bold text-blue-600">AI Recruitment Pipeline</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <StepIndicator currentPhase={state.currentPhase} dispatch={dispatch} />
                <div className="mt-8">
                    {renderPhase()}
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <RecruitmentProvider>
            <AppContent />
        </RecruitmentProvider>
    );
};

export default App;