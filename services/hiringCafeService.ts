import { HiringCafeJob } from '../types';

const API_PROXY = '/api/hiring-cafe';

/**
 * Fetches the latest job listings via the local API proxy which forwards the request to hiring.cafe.
 */
export const fetchHiringCafeJobs = async (): Promise<HiringCafeJob[]> => {
    try {
        const response = await fetch(API_PROXY);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        return data as HiringCafeJob[];
    } catch (error) {
        console.error("Error fetching jobs from hiring.cafe proxy:", error);
        throw new Error("Failed to load job listings from hiring.cafe. Please try again later.");
    }
};