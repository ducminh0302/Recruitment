import React, { useEffect, useState } from 'react';
import { useRecruitmentContext } from '../../context/RecruitmentContext';
import { screenCandidate } from '../../services/geminiService';
import { AppPhase, Candidate } from '../../types';
import Loader from '../Loader';
import { ChartBarIcon, DocumentTextIcon } from '../icons';

const Phase2_AIScreening: React.FC = () => {
    const { state, dispatch } = useRecruitmentContext();
    const { candidates, jobDescription } = state;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processedCandidates, setProcessedCandidates] = useState<Candidate[]>([]);

    useEffect(() => {
        const performScreening = async () => {
            if (!jobDescription || candidates.length === 0) {
                setError("Missing job description or candidates. Please start over.");
                setIsLoading(false);
                return;
            }

            try {
                const screeningPromises = candidates.map(c => screenCandidate(c.profile, jobDescription.rubric));
                const results = await Promise.all(screeningPromises);

                const updatedCandidates = candidates.map((candidate, index) => {
                    const screeningResult = results[index];
                    return screeningResult ? { ...candidate, screening: screeningResult } : candidate;
                });
                
                setProcessedCandidates(updatedCandidates);
                dispatch({ type: 'SET_CANDIDATES', payload: updatedCandidates });

            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError('An unexpected error occurred during AI screening. Please try again.');
                }
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        performScreening();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleConfirm = () => {
        dispatch({ type: 'SET_PHASE', payload: AppPhase.QUESTION_GENERATION });
    };
    
    const qualifiedCandidates = processedCandidates.filter(c => c.screening?.status === 'Qualified');
    const disqualifiedCandidates = processedCandidates.filter(c => c.screening?.status === 'Disqualified');


    if (isLoading) {
        return <Loader text={`Screening ${candidates.length} candidates...`} />;
    }

    if (error) {
        return <p className="text-red-600 text-center">{error}</p>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-blue-600 mb-4">AI Screening Results</h2>
                <p className="text-gray-600 mb-6">
                    Candidates have been automatically scored against the job description's rubric. Qualified candidates are moved forward.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-semibold text-green-600 mb-4">Qualified Candidates ({qualifiedCandidates.length})</h3>
                         <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                             {qualifiedCandidates.map(c => <CandidateCard key={c.id} candidate={c} />)}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold text-red-600 mb-4">Disqualified Candidates ({disqualifiedCandidates.length})</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {disqualifiedCandidates.map(c => <CandidateCard key={c.id} candidate={c} />)}
                        </div>
                    </div>
                </div>

                 <div className="mt-8 flex justify-end">
                     <button
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                        disabled={qualifiedCandidates.length === 0}
                    >
                        Proceed with Qualified Candidates
                    </button>
                </div>

            </div>
        </div>
    );
};


const CandidateCard: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
    const score = candidate.screening?.totalScore ?? 0;
    const status = candidate.screening?.status ?? 'N/A';
    const scoreColor = status === 'Qualified' ? 'text-green-600' : 'text-red-600';

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-900">{candidate.profile.name}</p>
                    <p className="text-sm text-gray-600">{candidate.profile.email}</p>
                </div>
                 <div className="text-right">
                    <p className={`text-2xl font-bold ${scoreColor}`}>{score.toFixed(0)}</p>
                    <p className={`text-xs font-semibold ${scoreColor}`}>{status}</p>
                </div>
            </div>
            <p className="text-sm text-gray-700 mt-3 border-t border-gray-200 pt-3">
               <span className="font-semibold">AI Summary:</span> {candidate.screening?.summary}
            </p>
        </div>
    )
}


export default Phase2_AIScreening;