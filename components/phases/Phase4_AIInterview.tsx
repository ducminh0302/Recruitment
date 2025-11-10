import React, { useState, useEffect } from 'react';
import { useRecruitmentContext } from '../../context/RecruitmentContext';
import { evaluateInterview } from '../../services/geminiService';
import { AppPhase, InterviewAnswer } from '../../types';
import Loader from '../Loader';

const Phase4_AIInterview: React.FC = () => {
    const { state, dispatch } = useRecruitmentContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const qualifiedCandidates = state.candidates.filter(c => c.screening?.status === 'Qualified');
    const selectedCandidate = state.candidates.find(c => c.id === state.selectedCandidateId);
    
    const allQuestions = selectedCandidate?.questions 
        ? [...selectedCandidate.questions.technicalQuestions, ...selectedCandidate.questions.cultureFitQuestions] 
        : [];

    const [answers, setAnswers] = useState<InterviewAnswer[]>(() => 
        allQuestions.map(q => ({ question: q, answer: '' }))
    );

    useEffect(() => {
        // Reset answers if selected candidate changes
        const questions = selectedCandidate?.questions ? [...selectedCandidate.questions.technicalQuestions, ...selectedCandidate.questions.cultureFitQuestions] : [];
        setAnswers(questions.map(q => ({ question: q, answer: '' })));
    }, [state.selectedCandidateId, selectedCandidate?.questions]);

    const handleAnswerChange = (question: string, answer: string) => {
        setAnswers(prev => prev.map(a => a.question === question ? { ...a, answer } : a));
    };

    const handleEvaluate = async () => {
        if (!selectedCandidate || !state.jobDescription || answers.some(a => !a.answer.trim())) {
            setError("Please answer all questions for the selected candidate.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const evaluation = await evaluateInterview(answers, selectedCandidate.profile, state.jobDescription.text);
            if (evaluation) {
                const updatedCandidate = { ...selectedCandidate, interviewAnswers: answers, interviewEvaluation: evaluation };
                dispatch({ type: 'UPDATE_CANDIDATE', payload: updatedCandidate });
            } else {
                setError('Failed to evaluate interview answers.');
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unexpected error occurred during AI evaluation.');
            }
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleProceed = () => {
        dispatch({ type: 'SET_PHASE', payload: AppPhase.REPORT });
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">AI Interview Evaluation</h2>
            <p className="text-gray-600 mb-6">
                Enter the candidate's answers to the generated questions. The AI will then evaluate the quality and relevance of their responses.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Interview Candidates</h3>
                    <ul className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                        {qualifiedCandidates.filter(c => c.questions).map(c => (
                            <li key={c.id}>
                                <button
                                    onClick={() => dispatch({ type: 'SET_SELECTED_CANDIDATE', payload: c.id })}
                                    className={`w-full text-left p-3 rounded-md transition-colors border ${state.selectedCandidateId === c.id ? 'bg-blue-600 border-blue-600' : 'bg-white hover:bg-gray-100 border-gray-200'}`}
                                >
                                    <p className={`font-semibold ${state.selectedCandidateId === c.id ? 'text-white' : 'text-gray-800'}`}>{c.profile.name}</p>
                                    <p className={`text-sm ${state.selectedCandidateId === c.id ? 'text-blue-100' : 'text-gray-500'}`}>{c.interviewEvaluation ? 'Evaluated ✅' : 'Pending'}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="md:col-span-2">
                    {selectedCandidate && allQuestions.length > 0 ? (
                        <div className="space-y-6">
                            {answers.map((item, index) => (
                                <div key={index} className="bg-gray-50/70 border border-gray-200 p-4 rounded-lg">
                                    <label className="block text-md font-medium text-gray-800 mb-2">{index + 1}. {item.question}</label>
                                    <textarea
                                        value={item.answer}
                                        onChange={(e) => handleAnswerChange(item.question, e.target.value)}
                                        placeholder="Enter candidate's answer here..."
                                        className="w-full h-24 p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                                        disabled={isLoading || !!selectedCandidate.interviewEvaluation}
                                    />
                                </div>
                            ))}
                            {isLoading && <Loader text="Evaluating answers..." />}
                            {error && <p className="text-red-600 mt-4">{error}</p>}
                            {!selectedCandidate.interviewEvaluation && !isLoading && (
                                <div className="flex justify-end mt-4">
                                     <button
                                        onClick={handleEvaluate}
                                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Evaluate Answers
                                    </button>
                                </div>
                            )}

                             {selectedCandidate.interviewEvaluation && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <h3 className="text-lg font-semibold text-green-700">Evaluation Complete</h3>
                                    <p className="text-green-800 mt-2">
                                       <span className="font-bold">Summary:</span> {selectedCandidate.interviewEvaluation.overallSummary}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                         <div className="flex items-center justify-center h-full p-4 bg-gray-50/70 border border-gray-200 rounded-lg text-gray-500">
                            <p>Select a candidate with generated questions to begin the interview.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleProceed}
                    disabled={!qualifiedCandidates.some(c => c.interviewEvaluation)}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    Proceed to Final Report
                </button>
            </div>
        </div>
    );
};

export default Phase4_AIInterview;