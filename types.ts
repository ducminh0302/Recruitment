
export enum AppPhase {
    JOB_DESCRIPTION = 'JOB_DESCRIPTION',
    CV_SCANNING = 'CV_SCANNING',
    SCREENING = 'SCREENING',
    QUESTION_GENERATION = 'QUESTION_GENERATION',
    INTERVIEW = 'INTERVIEW',
    REPORT = 'REPORT',
}

export interface RubricItem {
    criterion: string;
    weight: number;
    description: string;
}

export interface JobDescription {
    text: string;
    rubric: RubricItem[];
}

export interface CandidateProfile {
    name: string;
    email: string;
    phone: string;
    summary: string;
    skills: string[];
    experience: WorkExperience[];
    education: Education[];
}

export interface WorkExperience {
    jobTitle: string;
    company: string;
    duration: string;
    responsibilities: string;
}

export interface Education {
    degree: string;
    university: string;
    graduationYear: string;
}

export interface ScreeningScore {
    criterion: string;
    score: number;
    justification: string;
}

export interface InterviewQuestion {
    technicalQuestions: string[];
    cultureFitQuestions: string[];
}

export interface InterviewAnswer {
    question: string;
    answer: string;
}

export interface InterviewEvaluation {
    evaluation: {
        question: string;
        answer: string;
        score: number;
        feedback: string;
    }[];
    overallSummary: string;
}

export interface FinalReport {
    recommendation: 'Recommend' | 'Consider' | 'Reject';
    ceoSummary: string;
    strengths: string[];
    weaknesses: string[];
}


export interface Candidate {
    id: string;
    profile: CandidateProfile;
    screening?: {
        scores: ScreeningScore[];
        totalScore: number;
        summary: string;
        status: 'Qualified' | 'Disqualified';
    };
    questions?: InterviewQuestion;
    interviewAnswers?: InterviewAnswer[];
    interviewEvaluation?: InterviewEvaluation;
    finalReport?: FinalReport;
}
   