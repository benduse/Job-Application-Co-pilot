import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!API_KEY) {
	console.error("GEMINI_API_KEY (or API_KEY) environment variable not set.");
	process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Schemas mirrored from client to validate structured responses
const responseSchema = {
	type: Type.OBJECT,
	properties: {
		matchScore: { type: Type.INTEGER },
		summary: { type: Type.STRING },
		strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
		gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
		matchedKeywords: { type: Type.ARRAY, items: { type: Type.OBJECT } },
		missingKeywords: { type: Type.ARRAY, items: { type: Type.OBJECT } },
		improvementSuggestions: { type: Type.ARRAY, items: { type: Type.OBJECT } },
		coverLetterDraft: { type: Type.STRING },
	},
	required: [
		"matchScore",
		"summary",
		"strengths",
		"gaps",
		"matchedKeywords",
		"missingKeywords",
		"improvementSuggestions",
		"coverLetterDraft",
	],
};

const distanceSchema = {
	type: Type.OBJECT,
	properties: {
		distance: { type: Type.NUMBER },
		unit: { type: Type.STRING },
		originAddress: { type: Type.STRING },
		destinationAddress: { type: Type.STRING },
	},
	required: ["distance", "unit", "originAddress", "destinationAddress"],
};

const jobListingsSchema = {
	type: Type.OBJECT,
	properties: {
		jobs: {
			type: Type.ARRAY,
			items: { type: Type.OBJECT },
		},
	},
	required: ["jobs"],
};

// POST /api/analyze
app.post("/api/analyze", async (req, res) => {
	const { resume, jobDescription } = req.body;
	if (!resume || !jobDescription)
		return res.status(400).json({ error: "Missing resume or jobDescription" });

	const prompt = `
You are an expert career coach and professional resume writer. Your task is to analyze a candidate's resume against a job description and provide a detailed, actionable analysis in JSON.

Candidate Resume:\n---\n${resume}\n---\n\nJob Description:\n---\n${jobDescription}\n---\n
Respond ONLY with valid JSON matching the schema.`;

	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: prompt,
			config: {
				responseMimeType: "application/json",
				responseSchema,
				temperature: 0.5,
			},
		});

		const text = response.text?.trim();
		if (!text)
			return res.status(502).json({ error: "Empty response from model" });

		const parsed = JSON.parse(text);
		return res.json(parsed);
	} catch (err) {
		console.error("Analyze error", err);
		return res.status(500).json({ error: "Failed to analyze job fit" });
	}
});

// POST /api/fetch-description
app.post("/api/fetch-description", async (req, res) => {
	const { url } = req.body;
	if (!url) return res.status(400).json({ error: "Missing url" });

	const prompt = `You are an expert web scraping assistant. Extract the job description text from the provided URL and return ONLY the raw text. URL: ${url}`;
	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: prompt,
			config: { tools: [{ googleSearch: {} }] },
		});
		const text = response.text?.trim();
		return res.json({ text: text || "" });
	} catch (err) {
		console.error("Fetch description error", err);
		return res.status(500).json({ error: "Failed to fetch job description" });
	}
});

// POST /api/distance
app.post("/api/distance", async (req, res) => {
	const { origin, destination } = req.body;
	if (!origin || !destination)
		return res.status(400).json({ error: "Missing origin or destination" });

	const prompt = `You are a mapping assistant. Calculate the driving distance (miles) between Origin: ${origin} and Destination: ${destination}. Return JSON.`;
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
		const text = response.text?.trim();
		const parsed = JSON.parse(text || "{}");
		return res.json(parsed);
	} catch (err) {
		console.error("Distance error", err);
		return res.status(500).json({ error: "Failed to calculate distance" });
	}
});

// POST /api/reverse-geocode
app.post("/api/reverse-geocode", async (req, res) => {
	const { lat, lon } = req.body;
	if (typeof lat !== "number" || typeof lon !== "number")
		return res.status(400).json({ error: "Missing lat/lon" });

	const prompt = `What is the full street address for coordinates latitude ${lat}, longitude ${lon}? Return only the address.`;
	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: prompt,
			config: {
				tools: [{ googleMaps: {} }],
				toolConfig: {
					retrievalConfig: { latLng: { latitude: lat, longitude: lon } },
				},
			},
		});
		const text = response.text?.trim() || "";
		return res.json({ address: text });
	} catch (err) {
		console.error("Reverse geocode error", err);
		return res.status(500).json({ error: "Failed to determine address" });
	}
});

// GET /api/hiring-cafe -> proxy
app.get("/api/hiring-cafe", async (req, res) => {
	try {
		const r = await fetch("https://hiring.cafe/api/v1/jobs");
		const data = await r.json();
		return res.json(data);
	} catch (err) {
		console.error("Hiring.cafe proxy error", err);
		return res.status(500).json({ error: "Failed to fetch hiring.cafe jobs" });
	}
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API proxy listening on port ${port}`));
