import React, { useState, useEffect } from 'react';
import { useRecruitmentContext } from '../../context/RecruitmentContext';
import { generateInterviewQuestions } from '../../services/geminiService';
import { AppPhase, Candidate } from '../../types';
import Loader from '../Loader';

const Phase3_QuestionGeneration: React.FC = () => {
    const { state, dispatch } = useRecruitmentContext();
    const { candidates, jobDescription } = state;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const qualifiedCandidates = candidates.filter(c => c.screening?.status === 'Qualified');
    const selectedCandidate = candidates.find(c => c.id === state.selectedCandidateId);

    useEffect(() => {
        // Auto-select the first qualified candidate if none is selected
        if (!state.selectedCandidateId && qualifiedCandidates.length > 0) {
            dispatch({ type: 'SET_SELECTED_CANDIDATE', payload: qualifiedCandidates[0].id });
        }
    }, [state.selectedCandidateId, qualifiedCandidates, dispatch]);

    const handleGenerateQuestions = async () => {
        if (!selectedCandidate || !jobDescription) {
            setError("Please select a candidate.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const questions = await generateInterviewQuestions(selectedCandidate.profile, jobDescription.text);
            if (questions) {
                const updatedCandidate = { ...selectedCandidate, questions };
                dispatch({ type: 'UPDATE_CANDIDATE', payload: updatedCandidate });
            } else {
                setError('Failed to generate questions.');
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unexpected error occurred while generating questions.');
            }
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleProceed = () => {
        dispatch({ type: 'SET_PHASE', payload: AppPhase.INTERVIEW });
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">AI Question Generation</h2>
            <p className="text-gray-600 mb-6">
                Select a qualified candidate to generate a customized set of interview questions based on their profile and the job description.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Qualified Candidates</h3>
                    <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {qualifiedCandidates.map(c => (
                            <li key={c.id}>
                                <button
                                    onClick={() => dispatch({ type: 'SET_SELECTED_CANDIDATE', payload: c.id })}
                                    className={`w-full text-left p-3 rounded-md transition-colors border ${state.selectedCandidateId === c.id ? 'bg-blue-600 border-blue-600' : 'bg-white hover:bg-gray-100 border-gray-200'}`}
                                >
                                    <p className={`font-semibold ${state.selectedCandidateId === c.id ? 'text-white' : 'text-gray-800'}`}>{c.profile.name}</p>
                                    <p className={`text-sm ${state.selectedCandidateId === c.id ? 'text-blue-100' : 'text-gray-500'}`}>Score: {c.screening?.totalScore.toFixed(0)}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="md:col-span-2">
                    {selectedCandidate ? (
                        <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-lg">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedCandidate.profile.name}</h3>
                            {!selectedCandidate.questions && !isLoading && (
                                <button
                                    onClick={handleGenerateQuestions}
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Generate Interview Questions
                                </button>
                            )}

                            {isLoading && <Loader text="Generating questions..." />}
                            {error && <p className="text-red-600 mt-4">{error}</p>}
                            
                            {selectedCandidate.questions && (
                                <div>
                                    <h4 className="text-lg font-semibold text-blue-500 mt-6 mb-3">Technical Questions</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                                        {selectedCandidate.questions.technicalQuestions.map((q, i) => <li key={i}>{q}</li>)}
                                    </ul>

                                    <h4 className="text-lg font-semibold text-blue-500 mt-6 mb-3">Culture Fit Questions</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                                        {selectedCandidate.questions.cultureFitQuestions.map((q, i) => <li key={i}>{q}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full p-4 bg-gray-50/70 border border-gray-200 rounded-lg text-gray-500">
                            <p>Select a candidate to view details.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleProceed}
                    disabled={!qualifiedCandidates.some(c => c.questions)}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    Proceed to Interview Phase
                </button>
            </div>
        </div>
    );
};

export default Phase3_QuestionGeneration;