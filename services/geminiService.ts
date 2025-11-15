import { GoogleGenAI, Type } from "@google/genai";
import { JobAnalysis, JobListing, DistanceResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        matchScore: {
            type: Type.INTEGER,
            description: "A score from 0 to 100 representing how well the resume matches the job description.",
        },
        summary: {
            type: Type.STRING,
            description: "A brief, one-paragraph summary of the candidate's fit for the role.",
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key skills and experiences from the resume that directly match the job requirements.",
        },
        gaps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of areas where the candidate's resume is lacking compared to the job description.",
        },
        matchedKeywords: {
            type: Type.ARRAY,
            description: "Keywords from the job description that are present in the resume. Include a brief definition for each.",
            items: {
                type: Type.OBJECT,
                properties: {
                    keyword: { type: Type.STRING },
                    definition: { type: Type.STRING, description: "A brief, one-sentence definition of the keyword in the context of this job." }
                },
                required: ["keyword", "definition"]
            }
        },
        missingKeywords: {
            type: Type.ARRAY,
            description: "Important keywords from the job description that are missing from the resume. Include a brief definition for each.",
            items: {
                type: Type.OBJECT,
                properties: {
                    keyword: { type: Type.STRING },
                    definition: { type: Type.STRING, description: "A brief, one-sentence definition of the keyword in the context of this job." }
                },
                required: ["keyword", "definition"]
            }
        },
        improvementSuggestions: {
            type: Type.ARRAY,
            description: "Specific, actionable suggestions to improve the resume. Each suggestion should pinpoint a sentence or phrase and offer a better alternative.",
            items: {
                type: Type.OBJECT,
                properties: {
                    originalText: { type: Type.STRING, description: "The exact sentence or phrase from the resume to be improved." },
                    suggestedRewrite: { type: Type.STRING, description: "The improved version of the text." },
                    suggestionType: { type: Type.STRING, description: "The category of suggestion, e.g., 'Add Metrics', 'Rewrite for Clarity', 'Action Verb'." }
                },
                required: ["originalText", "suggestedRewrite", "suggestionType"]
            }
        },
        coverLetterDraft: {
            type: Type.STRING,
            description: "A professionally written, tailored cover letter draft based on the resume and job description, ready for the user to review and send."
        }
    },
    required: ["matchScore", "summary", "strengths", "gaps", "matchedKeywords", "missingKeywords", "improvementSuggestions", "coverLetterDraft"]
};


export const analyzeJobFit = async (resume: string, jobDescription: string): Promise<JobAnalysis> => {
    const prompt = `
        You are an expert career coach and professional resume writer. Your task is to analyze a candidate's resume against a job description and provide a detailed, actionable analysis in the specified JSON format.

        **Candidate's Resume:**
        ---
        ${resume}
        ---

        **Job Description:**
        ---
        ${jobDescription}
        ---

        Your analysis MUST include:
        1.  **Keyword Analysis**:
            -   \`matchedKeywords\`: Identify important keywords/skills from the job description that ARE PRESENT in the resume. Provide a brief, one-sentence technical or business definition for each keyword.
            -   \`missingKeywords\`: Identify critical keywords/skills from the job description that ARE MISSING from the resume. Provide a brief, one-sentence definition for each.
        2.  **Actionable Improvement Suggestions**:
            -   \`improvementSuggestions\`: Scrutinize the resume for sections that can be improved. Identify at least 2-3 specific sentences or bullet points. For each, provide the \`originalText\` and a \`suggestedRewrite\`. The rewrite should be more impactful, use stronger action verbs, or add quantifiable metrics (you can use placeholders like "[Number]%" or "[Specific Metric]"). Categorize each suggestion with a \`suggestionType\` like 'Add Metrics', 'Rewrite for Clarity', or 'Action Verb'.
        3.  **Overall Assessment**:
            -   \`matchScore\`: An integer score from 0-100.
            -   \`summary\`: A brief summary of the candidate's fit.
            -   \`strengths\`: A list of key experiences that match the job.
            -   \`gaps\`: A list of areas where the resume is lacking.
        4.  **Cover Letter**:
            -   \`coverLetterDraft\`: A professionally written, tailored cover letter draft.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);
        return parsedData as JobAnalysis;
    } catch (error) {
        console.error("Error analyzing job fit:", error);
        throw new Error("Failed to get analysis from Gemini API. Please check your API key and the model's availability.");
    }
};

export const fetchJobDescriptionFromUrl = async (url: string): Promise<string> => {
    const prompt = `
        You are an expert web scraping assistant. Your task is to extract the full text of the job description from the provided URL.
        Focus on the main content of the job posting, including responsibilities, qualifications, and benefits.
        Exclude irrelevant information like website headers, footers, navigation bars, and advertisements.
        Return ONLY the raw text of the job description. Do not include any introductory phrases like "Here is the job description:" or any other commentary.

        URL: ${url}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("The model did not return any text. The URL might be inaccessible or the job description could not be found.");
        }

        return text.trim();
    // FIX: Replaced blockquote tags with curly braces for a valid catch block.
    } catch (error) {
        console.error("Error fetching job description:", error);
        throw new Error("Failed to fetch job description from the provided URL. Please check the link or paste the description manually.");
    }
};

export const answerQuestionAboutResume = async (resume: string, question: string): Promise<string> => {
    const prompt = `
        You are a professional career coach acting as the candidate. Your task is to answer the screening question provided below.
        Base your answer **strictly** on the content of the candidate's resume. Do not invent experience or skills not mentioned in the resume.
        The tone should be professional, confident, and concise.

        **Candidate's Resume:**
        ---
        ${resume}
        ---

        **Screening Question:**
        ---
        ${question}
        ---

        Please provide a direct answer to the question.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.3,
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("The model did not return an answer.");
        }
        return text.trim();
    } catch (error) {
        console.error("Error answering question:", error);
        throw new Error("Failed to get an answer from the Gemini API.");
    }
};

/**
 * Extracts raw text from a provided file using the Gemini API.
 * Supports file types like PDF and DOCX.
 */
export const extractTextFromFile = async (file: { mimeType: string; data: string }): Promise<string> => {
    const prompt = `
        You are an expert document text extraction tool.
        Your task is to extract all the text content from the provided file.
        Ignore any images, formatting, or non-text elements.
        Return ONLY the raw text content. Do not add any commentary, introductory phrases, or markdown formatting.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // This model can handle files
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: file.mimeType,
                            data: file.data
                        }
                    }
                ]
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("The model did not return any text from the file.");
        }
        return text.trim();
    } catch (error) {
        console.error("Error extracting text from file:", error);
        throw new Error("Failed to extract text from the provided file using the Gemini API.");
    }
};


const jobListingsSchema = {
    type: Type.OBJECT,
    properties: {
        jobs: {
            type: Type.ARRAY,
            description: "A list of found job listings.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    url: { type: Type.STRING },
                    snippet: { type: Type.STRING, description: "A brief, one or two-sentence snippet from the job description." }
                },
                required: ["title", "company", "url", "snippet"]
            }
        }
    },
    required: ["jobs"]
};

export const searchForJobs = async (query: string, site: string): Promise<JobListing[]> => {
     const prompt = `
        You are a job search assistant. Your task is to find job listings based on the provided query and target site.
        Use Google Search to find relevant job postings.
        Return up to 10 job listings.

        **Search Query:** "${query}"
        **Target Site:** ${site}

        Your response MUST be in the specified JSON format. For the 'url', provide the full, direct URL to the job posting.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: jobListingsSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);
        return (parsedData.jobs || []) as JobListing[];
    } catch (error) {
        console.error("Error searching for jobs:", error);
        throw new Error("Failed to get job listings from the Gemini API. The search may have returned no results.");
    }
}

const distanceSchema = {
    type: Type.OBJECT,
    properties: {
        distance: { type: Type.NUMBER, description: "The calculated driving distance." },
        unit: { type: Type.STRING, description: "The unit of distance, e.g., 'miles' or 'kilometers'." },
        originAddress: { type: Type.STRING, description: "The full, resolved origin address." },
        destinationAddress: { type: Type.STRING, description: "The full, resolved destination address." }
    },
    required: ["distance", "unit", "originAddress", "destinationAddress"]
};

export const calculateDistance = async (origin: string, destination: string): Promise<DistanceResult> => {
    const prompt = `
        You are a mapping assistant. Your task is to calculate the driving distance between two locations.
        Origin: ${origin}
        Destination: ${destination}

        Please calculate the most common driving route distance and return it in miles.
        Your response MUST be in the specified JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                responseMimeType: "application/json",
                responseSchema: distanceSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DistanceResult;
    } catch (error) {
        console.error("Error calculating distance:", error);
        throw new Error("Failed to calculate distance. Please ensure the addresses are valid and try again.");
    }
};

export const getAddressFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    const prompt = `What is the full street address for the geographic coordinates: latitude ${lat}, longitude ${lon}? Return only the single, most likely street address as a raw string, with no extra text or labels.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: lat,
                            longitude: lon
                        }
                    }
                }
            },
        });
        const text = response.text;
        if (!text) {
            throw new Error("Could not determine address from coordinates.");
        }
        return text.trim();
    } catch (error) {
        console.error("Error getting address from coordinates:", error);
        throw new Error("Failed to determine address from your current location.");
    }
};