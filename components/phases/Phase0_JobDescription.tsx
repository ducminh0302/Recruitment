import React, { useState } from 'react';
import { useRecruitmentContext } from '../../context/RecruitmentContext';
import { analyzeJobDescription } from '../../services/geminiService';
import { AppPhase, RubricItem } from '../../types';
import Loader from '../Loader';

const Phase0_JobDescription: React.FC = () => {
    const { dispatch } = useRecruitmentContext();
    const [jdText, setJdText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analyzedRubric, setAnalyzedRubric] = useState<RubricItem[] | null>(null);

    const handleAnalyze = async () => {
        if (!jdText.trim()) {
            setError('Please enter a job description.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalyzedRubric(null);
        try {
            const result = await analyzeJobDescription(jdText);
            if (result) {
                setAnalyzedRubric(result.rubric);
                // Wait for user to confirm before proceeding
            } else {
                setError('Failed to analyze the job description. The format might be unexpected.');
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirm = () => {
        if (analyzedRubric) {
            dispatch({ type: 'SET_JOB_DESCRIPTION', payload: { text: jdText, rubric: analyzedRubric } });
            dispatch({ type: 'SET_PHASE', payload: AppPhase.CV_SCANNING });
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">Job Description Analysis</h2>
            <p className="text-gray-600 mb-6">
                Start by pasting the job description into the text area below. The AI will analyze it to extract key criteria and create a standardized scoring rubric for candidate evaluation.
            </p>

            <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-64 p-4 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-shadow text-gray-800 resize-y"
                disabled={isLoading}
            />
            
            {error && <p className="text-red-600 mt-4">{error}</p>}

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || analyzedRubric !== null}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    Analyze Job Description
                </button>
            </div>
            
            {isLoading && <div className="mt-6"><Loader text="Analyzing job description..." /></div>}

            {analyzedRubric && (
                <div className="mt-8 p-4 bg-gray-50/70 border border-gray-200 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-500 mb-4">Generated Scoring Rubric</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criterion</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {analyzedRubric.map(item => (
                                    <tr key={item.criterion}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.criterion}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.weight}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="mt-6 flex justify-end">
                         <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                        >
                            Confirm & Proceed to CV Scanning
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Phase0_JobDescription;