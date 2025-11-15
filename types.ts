export interface JobAnalysis {
  matchScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  matchedKeywords: Keyword[];
  missingKeywords: Keyword[];
  improvementSuggestions: ImprovementSuggestion[];
  coverLetterDraft: string;
}

export interface Keyword {
  keyword: string;
  definition: string;
}

export interface ImprovementSuggestion {
  originalText: string;
  suggestedRewrite: string;
  suggestionType: string;
}

export interface Job {
  id: string;
  url: string;
  title: string;
  company: string;
  description: string;
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  analysis: JobAnalysis | null;
  analyzedAt?: string;
}

export interface SavedResume {
  _id: string;
  name: string;
  content: string;
  jobDescription: string;
  savedAt: string;
}

export interface JobListing {
  title: string;
  company: string;
  url: string;
  snippet: string;
}

export interface HiringCafeJob {
  id: string;
  company_name: string;
  title: string;
  description: string;
  location: string;
  url: string;
  tags: string[];
  company_logo_url: string;
  posted_at: string;
}

export interface DistanceResult {
    distance: number;
    unit: string;
    originAddress: string;
    destinationAddress: string;
}