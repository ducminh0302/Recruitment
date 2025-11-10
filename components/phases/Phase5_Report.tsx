import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRecruitmentContext } from '../../context/RecruitmentContext';
import { generateFinalReport } from '../../services/geminiService';
import { Candidate } from '../../types';
import Loader from '../Loader';

const Phase5_Report: React.FC = () => {
    const { state, dispatch } = useRecruitmentContext();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const evaluatedCandidates = state.candidates.filter(c => c.interviewEvaluation);

    useEffect(() => {
        const generateReports = async () => {
            setIsLoading(true);
            setError(null);
            
            const candidatesToReport = evaluatedCandidates.filter(c => !c.finalReport);

            if(candidatesToReport.length === 0) {
                setIsLoading(false);
                return;
            }

            try {
                const reportPromises = candidatesToReport.map(c => generateFinalReport(c));
                const reports = await Promise.all(reportPromises);

                reports.forEach((report, index) => {
                    if (report) {
                        const candidate = candidatesToReport[index];
                        const updatedCandidate = { ...candidate, finalReport: report };
                        dispatch({ type: 'UPDATE_CANDIDATE', payload: updatedCandidate });
                    }
                });

            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError('An unexpected error occurred while generating final reports.');
                }
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        generateReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const getChartData = () => {
        return evaluatedCandidates.map(c => {
            const screeningScore = c.screening?.totalScore ?? 0;
            const interviewScores = c.interviewEvaluation?.evaluation.map(e => e.score) ?? [0];
            const avgInterviewScore = (interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length) * 10; // scale to 100

            return {
                name: c.profile.name.split(' ')[0],
                screeningScore,
                interviewScore: avgInterviewScore,
            };
        }).sort((a,b) => (b.screeningScore + b.interviewScore) - (a.screeningScore + a.interviewScore));
    };

    const handleReset = () => {
        dispatch({ type: 'RESET_STATE' });
    };
    
    if (isLoading) {
        return <Loader text="Generating final reports and dashboard..." />;
    }

    if (error) {
        return <p className="text-red-600 text-center">{error}</p>;
    }
    
    if (evaluatedCandidates.length === 0) {
        return (
             <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
                 <h2 className="text-2xl font-bold text-blue-600 mb-4">No candidates have been fully evaluated.</h2>
             </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-blue-600 mb-2">Final Report & Dashboard</h2>
            <p className="text-gray-600 mb-8">
                This dashboard summarizes the entire recruitment process, providing a comparative analysis and final recommendations.
            </p>

            <div className="bg-gray-50/70 border border-gray-200 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold text-blue-500 mb-4">Candidate Performance Comparison</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={getChartData()} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}/>
                            <Legend />
                            <Bar dataKey="screeningScore" fill="#3b82f6" name="Screening Score" />
                            <Bar dataKey="interviewScore" fill="#10b981" name="Interview Score" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-blue-500 mb-4">Ranked Candidate Summaries</h3>
                <div className="space-y-6">
                    {state.candidates.filter(c => c.finalReport).sort((a, b) => {
                        const rankOrder = { 'Recommend': 1, 'Consider': 2, 'Reject': 3 };
                        return rankOrder[a.finalReport!.recommendation] - rankOrder[b.finalReport!.recommendation];
                    }).map(candidate => (
                        <CandidateReportCard key={candidate.id} candidate={candidate} />
                    ))}
                </div>
            </div>
            
            <div className="mt-12 pt-6 border-t border-gray-200 flex justify-end">
                <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    Complete & Start New Recruitment
                </button>
            </div>
        </div>
    );
};


const CandidateReportCard: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
    const { finalReport } = candidate;

    if (!finalReport) return null;

    const recommendationColor = {
        'Recommend': 'bg-green-100 border-green-300 text-green-800',
        'Consider': 'bg-yellow-100 border-yellow-300 text-yellow-800',
        'Reject': 'bg-red-100 border-red-300 text-red-800',
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-2xl font-bold text-gray-900">{candidate.profile.name}</h4>
                <span className={`px-4 py-1 text-sm font-medium rounded-full border ${recommendationColor[finalReport.recommendation]}`}>
                    {finalReport.recommendation}
                </span>
            </div>

            <div className="mb-4">
                <h5 className="font-semibold text-blue-600 mb-2">CEO Summary</h5>
                <p className="text-gray-700">{finalReport.ceoSummary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h5 className="font-semibold text-green-600 mb-2">Strengths</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {finalReport.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                 <div>
                    <h5 className="font-semibold text-red-600 mb-2">Weaknesses</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                         {finalReport.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Phase5_Report;