import { GoogleGenAI, Type } from "@google/genai";
import { JobDescription, RubricItem, CandidateProfile, ScreeningScore, InterviewQuestion, InterviewAnswer, InterviewEvaluation, FinalReport } from '../types';

const model = "gemini-2.5-flash";

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found. Please make sure the API_KEY environment variable is set.");
    }
    return new GoogleGenAI({ apiKey });
};

const parseJsonResponse = <T,>(text: string): T | null => {
    try {
        const cleanedText = text.replace(/^```json\n?/, '').replace(/```$/, '');
        return JSON.parse(cleanedText) as T;
    } catch (error) {
        console.error("Failed to parse JSON response:", error);
        console.error("Original text:", text);
        return null;
    }
};

export const analyzeJobDescription = async (jdText: string): Promise<JobDescription | null> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model,
        contents: `Analyze the following job description. Extract key responsibilities, required skills (technical and soft), required education, and years of experience. Based on this, generate a JSON scoring rubric with weighted criteria for evaluating candidates. The criteria should include 'skillMatch', 'experience', 'education', and 'keywords'. Each criterion must have a 'weight' (a number between 0 and 1) and a 'description'. The sum of weights should be 1.
        
        Job Description:
        ${jdText}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    rubric: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                criterion: { type: Type.STRING },
                                weight: { type: Type.NUMBER },
                                description: { type: Type.STRING }
                            },
                            required: ["criterion", "weight", "description"]
                        }
                    }
                },
                required: ["rubric"]
            }
        }
    });

    const parsed = parseJsonResponse<{ rubric: RubricItem[] }>(response.text);
    return parsed ? { text: jdText, rubric: parsed.rubric } : null;
};

export const parseCv = async (file: { data: string, mimeType: string }): Promise<CandidateProfile | null> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model,
        contents: [
            {
                inlineData: {
                    data: file.data,
                    mimeType: file.mimeType,
                }
            },
            {
                text: `Extract key information from the provided CV document. Identify and structure the following details into a JSON object: name, email, phone, summary (a brief professional overview), skills (as an array of strings), experience (an array of objects with jobTitle, company, duration, and responsibilities), and education (an array of objects with degree, university, and graduationYear). If any piece of information is not present, use an empty string "" for string fields or an empty array [] for array fields.`
            }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    email: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    experience: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                jobTitle: { type: Type.STRING },
                                company: { type: Type.STRING },
                                duration: { type: Type.STRING },
                                responsibilities: { type: Type.STRING }
                            },
                             required: ["jobTitle", "company", "duration", "responsibilities"]
                        }
                    },
                    education: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                degree: { type: Type.STRING },
                                university: { type: Type.STRING },
                                graduationYear: { type: Type.STRING }
                            },
                             required: ["degree", "university", "graduationYear"]
                        }
                    }
                },
                 required: ["name", "email", "summary", "skills", "experience", "education"]
            }
        }
    });
    return parseJsonResponse<CandidateProfile>(response.text);
};


export const screenCandidate = async (candidateProfile: CandidateProfile, rubric: RubricItem[]): Promise<{ scores: ScreeningScore[], totalScore: number, summary: string, status: 'Qualified' | 'Disqualified' } | null> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model,
        contents: `You are an expert HR screener. Evaluate this candidate's profile against the job description rubric. For each criterion in the rubric, provide a score from 1 to 10 and a brief justification. Calculate a total weighted score (sum of score * weight, scaled to 100). Provide an overall summary and a recommendation ('Qualified' or 'Disqualified' based on a threshold of 65).

        Candidate Profile:
        ${JSON.stringify(candidateProfile)}
        
        Scoring Rubric:
        ${JSON.stringify(rubric)}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    scores: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                criterion: { type: Type.STRING },
                                score: { type: Type.NUMBER },
                                justification: { type: Type.STRING }
                            },
                            required: ["criterion", "score", "justification"]
                        }
                    },
                    totalScore: { type: Type.NUMBER },
                    summary: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['Qualified', 'Disqualified'] }
                },
                required: ["scores", "totalScore", "summary", "status"]
            }
        }
    });

    return parseJsonResponse<{ scores: ScreeningScore[], totalScore: number, summary: string, status: 'Qualified' | 'Disqualified' }>(response.text);
};

export const generateInterviewQuestions = async (candidateProfile: CandidateProfile, jdText: string): Promise<InterviewQuestion | null> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model,
        contents: `Based on the candidate's CV and the job description, generate a set of 5 technical interview questions and 3 culture fit questions. Technical questions should probe their specific skills and project experience. Culture fit questions should align with a collaborative and innovative work environment.

        Candidate Profile:
        ${JSON.stringify(candidateProfile)}
        
        Job Description:
        ${jdText}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    technicalQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    cultureFitQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["technicalQuestions", "cultureFitQuestions"]
            }
        }
    });

    return parseJsonResponse<InterviewQuestion>(response.text);
};

export const evaluateInterview = async (answers: InterviewAnswer[], candidateProfile: CandidateProfile, jdText: string): Promise<InterviewEvaluation | null> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model,
        contents: `You are an expert interviewer. Evaluate the candidate's answers in the context of their CV and the job description. For each answer, assess its technical correctness, logical reasoning, and communication clarity. Provide a score (1-10) and brief feedback for each answer. Finally, give an overall interview performance summary.
        
        Job Description:
        ${jdText}
        
        Candidate Profile:
        ${JSON.stringify(candidateProfile)}
        
        Interview Q&A:
        ${JSON.stringify(answers)}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    evaluation: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING },
                                score: { type: Type.NUMBER },
                                feedback: { type: Type.STRING }
                            },
                             required: ["question", "answer", "score", "feedback"]
                        }
                    },
                    overallSummary: { type: Type.STRING }
                },
                 required: ["evaluation", "overallSummary"]
            }
        }
    });

    return parseJsonResponse<InterviewEvaluation>(response.text);
};

export const generateFinalReport = async (candidate: any): Promise<FinalReport | null> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model,
        contents: `Given all the collected data for this candidate, provide a final hiring recommendation: 'Recommend', 'Consider', or 'Reject'. Also, provide a concise summary for a CEO-level report, including 3 strengths and 3 weaknesses.

        Candidate Data:
        ${JSON.stringify({ profile: candidate.profile, screening: candidate.screening, interviewEvaluation: candidate.interviewEvaluation })}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    recommendation: { type: Type.STRING, enum: ['Recommend', 'Consider', 'Reject'] },
                    ceoSummary: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["recommendation", "ceoSummary", "strengths", "weaknesses"]
            }
        }
    });

    return parseJsonResponse<FinalReport>(response.text);
}