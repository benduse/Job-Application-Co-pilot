# Job Application Co-Pilot

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

An intelligent assistant that automates the screening of your resume against job descriptions. This tool provides a match score, highlights strengths and weaknesses, and generates a tailored cover letter draft to increase your chances of getting an interview.

---

## About The Project

The modern job market is competitive and demanding. Manually tailoring your resume, writing unique cover letters, and screening dozens of job descriptions can be a full-time job in itself. The Job Application Co-Pilot is designed to **automate this entire pre-application workflow**.

By leveraging the advanced reasoning capabilities of the Google Gemini API, this application acts as your personal career assistant. It automates the process of screening your resume against job descriptions, identifying your best-fit opportunities, and preparing tailored application materials. It transforms hours of manual, repetitive work into a streamlined, strategic process, giving you the competitive edge you need to land your next interview.

### Key Features

This application automates your job search with a suite of powerful features:

-   **Multi-Job Dashboard**: Manage and analyze multiple job applications from a single, unified dashboard.
-   **Sortable Dashboard**: Organize your job applications by title, company, or last analyzed date to easily track your progress.
-   **Resume vs. Job Description Analysis**: Get an instant, detailed comparison between your resume and the roles you're applying for.
-   **Match Score & Breakdown**: Quantify your fit with a percentage score and see a clear breakdown of your strengths and potential gaps for each job.
-   **Interactive AI Suggestions**: Accept one-click resume improvements that update your master resume for all applications.
-   **AI-Generated Cover Letter**: Receive a professionally written, tailored cover letter draft for each job analysis.
-   **Screening Question Helper**: Get AI-powered suggestions for answering common screening questions based on your resume's content.
-   **Resume Version Management**: Save different versions of your resume tailored to specific jobs. Easily load, download (.txt), or delete them as needed.
-   **Live Job Browsing**: Browse the latest job postings from `hiring.cafe` in a visual, logo-driven interface. Import jobs to your dashboard with one click, and use the **Refresh** button to fetch the newest listings on demand.
-   **Integrated Job Search**: Find job listings from LinkedIn, Indeed, and Workday and add them to your dashboard with one click.
-   **Fetch Job Description from URL**: Automatically extract job description text directly from a job posting URL using Google Search grounding.

---

## Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI & Language Model**: Google Gemini API (`gemini-2.5-flash`)
-   **Testing**: Playwright for end-to-end tests.
-   **State Management**: React Hooks (`useState`, `useEffect`)
-   **Client-side Storage**: `localStorage` for saving resume versions.

---

## Project Structure

The project is organized into a modular structure that separates concerns, making it easier to maintain and scale.

```
/
├── components/               # Reusable React components
│   ├── AboutModal.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── JobCard.tsx           # The card for a single job analysis
│   └── ...
│
├── pages/                    # Page-level components
│   ├── JobListingsPage.tsx   # The main dashboard for managing multiple jobs
│   └── ...
│
├── services/                 # Business logic and external communication
│   ├── geminiService.ts      # Handles all API calls to the Google Gemini API
│   └── ...
│
├── tests/                    # End-to-end tests
│   └── api.spec.ts           # Playwright tests for API integrations
│
├── types.ts                  # TypeScript type definitions and interfaces
│
├── App.tsx                   # Main application component, handles routing and state
├── index.html                # The HTML entry point
├── index.tsx                 # The React application root
├── metadata.json             # Application metadata
└── README.md                 # This file
```

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need a Google Gemini API key to run this application.

-   Get your API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your-username/job-application-co-pilot.git
    ```
2.  **Install NPM packages**
    ```sh
    npm install
    ```
3.  **Set up your environment variables**

    Create a file named `.env` in the root of your project and add your API key:
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```
4.  **Run the application**
    ```sh
    npm run dev
    ```
    This will start the development server, and you can view the application in your browser.

---

## Running Tests

This project uses [Playwright](https://playwright.dev/) for end-to-end testing to ensure API integrations are working as expected. The tests use network mocking and do not require a real API key to run.

### Setup

1.  **Install Playwright browsers:**
    ```sh
    npx playwright install
    ```

### Running the Test Suite

1.  **Start the development server:**
    ```sh
    npm run dev
    ```
2.  **Run the Playwright tests in a separate terminal:**
    ```sh
    npx playwright test
    ```

---

## Automated Application Workflow

Follow these steps to automate your job application preparation process:

1.  **Load Your Master Resume**: Start by uploading or pasting your primary resume into the left-hand panel. This will be the baseline for all automated analyses.
2.  **Source Job Opportunities**:
    *   **Automated Search**: Use the "Search Jobs" or "Hiring.cafe" pages to find live job postings. With one click, you can add them to your dashboard, and the co-pilot will automatically fetch the job details.
    *   **Manual Entry**: If you have a job link, click "Add New Job" on the dashboard. Paste the URL, and the co-pilot will automatically scrape the description for you.
3.  **Initiate AI Analysis**: For any job on your dashboard, click "Analyze Match". The AI will perform a deep analysis, comparing your resume to the job description in seconds.
4.  **Review Actionable Insights**: The analysis will generate a match score, keyword breakdown, and a tailored cover letter. Most importantly, it will provide one-click "Actionable Suggestions" to improve your resume.
5.  **Iterate and Improve**: Accept the AI's suggestions to instantly update your master resume. This improves its quality for all future analyses, creating a powerful feedback loop.
6.  **Save and Organize**: After refining your resume, save the new version on the "Resumes" page. Use the dashboard's sorting features to track your applications and focus on the most promising leads.

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Acknowledgements

-   [Google Gemini](https://ai.google.dev/)
-   [React](https://reactjs.org/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Vite](https://vitejs.dev/)
-   [hiring.cafe](https://hiring.cafe/) for their public API.