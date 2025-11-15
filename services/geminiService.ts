import { JobAnalysis, JobListing, DistanceResult } from '../types';

// Client-side service: call the backend proxy endpoints instead of using the Gemini SDK in-browser.

const handleResponse = async (resp: Response) => {
  const text = await resp.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    // If not JSON, return raw text
    return text;
  }
};

export const analyzeJobFit = async (resume: string, jobDescription: string): Promise<JobAnalysis> => {
  const resp = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, jobDescription }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Failed to analyze job fit: ${body || resp.statusText}`);
  }
  const data = await handleResponse(resp);
  return data as JobAnalysis;
};

export const fetchJobDescriptionFromUrl = async (url: string): Promise<string> => {
  const resp = await fetch('/api/fetch-description', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Failed to fetch job description: ${body || resp.statusText}`);
  }
  const data = await resp.json();
  return (data.text || '').trim();
};

export const calculateDistance = async (origin: string, destination: string): Promise<DistanceResult> => {
  const resp = await fetch('/api/distance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin, destination }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Failed to calculate distance: ${body || resp.statusText}`);
  }
  const data = await resp.json();
  return data as DistanceResult;
};

export const getAddressFromCoordinates = async (lat: number, lon: number): Promise<string> => {
  const resp = await fetch('/api/reverse-geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Failed to get address from coordinates: ${body || resp.statusText}`);
  }
  const data = await resp.json();
  return data.address || '';
};

// The following functions require server-side implementation. Keep stubs that instruct developers to add server endpoints if needed.
export const answerQuestionAboutResume = async (_resume: string, _question: string): Promise<string> => {
  throw new Error('answerQuestionAboutResume is not implemented in the client. Call the backend proxy to use the Gemini API.');
};

export const extractTextFromFile = async (_file: { mimeType: string; data: string }): Promise<string> => {
  throw new Error('extractTextFromFile is not implemented in the client. Call the backend proxy to use the Gemini API for file extraction.');
};

export const searchForJobs = async (_query: string, _site: string): Promise<JobListing[]> => {
  throw new Error('searchForJobs is not implemented in the client. Implement a backend endpoint to perform job site searches.');
};