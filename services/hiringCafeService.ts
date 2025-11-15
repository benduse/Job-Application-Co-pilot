import { HiringCafeJob } from '../types';

const API_URL = 'https://hiring.cafe/api/v1/jobs';

/**
 * Fetches the latest job listings from the hiring.cafe API.
 */
export const fetchHiringCafeJobs = async (): Promise<HiringCafeJob[]> => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        // The API returns jobs in reverse chronological order by default.
        return data as HiringCafeJob[];
    } catch (error) {
        console.error("Error fetching jobs from hiring.cafe:", error);
        throw new Error("Failed to load job listings from hiring.cafe. Please try again later.");
    }
};