import { test, expect } from '@playwright/test';

// The URL for the Gemini API's generateContent method
const API_URL_REGEX = /.*models\/gemini-2.5-flash:generateContent.*/;

const MOCK_SUCCESS_RESPONSE = {
    matchScore: 95,
    summary: "Excellent fit! The candidate's experience in consultative selling and IT support aligns perfectly with the role's requirements.",
    strengths: ["Strong background in IT Support and Troubleshooting.", "Bilingual communication (English & Spanish) is a key asset."],
    gaps: ["No direct experience with the specific CRM mentioned in the job description."],
    matchedKeywords: [{ keyword: "IT Support", definition: "Providing technical assistance and troubleshooting." }],
    missingKeywords: [{ keyword: "Salesforce", definition: "A popular Customer Relationship Management (CRM) software." }],
    improvementSuggestions: [{
        originalText: "Engage inbound customers and manage high-volume interactions.",
        suggestedRewrite: "Successfully managed over 50 daily inbound customer interactions, providing expert technical and product support.",
        suggestionType: "Add Metrics"
    }],
    coverLetterDraft: "Dear Hiring Manager, I am writing to express my interest in the position..."
};

test.describe('API Integration Tests', () => {

  test('should display analysis results on successful API call', async ({ page }) => {
    // 1. Mock the API call to return a successful response
    await page.route(API_URL_REGEX, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SUCCESS_RESPONSE),
      });
    });

    // 2. Navigate to the application
    await page.goto('/');

    // 3. Fill in the resume (toggle to show text area first)
    await page.getByRole('button', { name: 'Or paste resume as text' }).click();
    await page.locator('#resume-input').fill('My test resume content.');

    // 4. Add a job and fill in the description
    await page.getByRole('button', { name: '+ Add New Job' }).click();
    await page.locator('[id^=job-desc-]').first().fill('My test job description.');

    // 5. Click the analyze button
    await page.getByRole('button', { name: 'Analyze Match' }).first().click();

    // 6. Assert that the results are displayed correctly based on the mock data
    await expect(page.locator('text=Analysis Complete')).toBeVisible();
    await expect(page.locator('text=95%')).toBeVisible();
    await expect(page.locator(`text=${MOCK_SUCCESS_RESPONSE.summary}`)).toBeVisible();
    await expect(page.locator('text=Matched Keywords')).toBeVisible();
    await expect(page.locator('text=IT Support')).toBeVisible();
  });

  test('should display an error message on failed API call', async ({ page }) => {
    // 1. Mock the API call to return a 500 server error
    await page.route(API_URL_REGEX, async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Internal Server Error' } }),
      });
    });

    // 2. Navigate to the application
    await page.goto('/');

    // 3. Fill in the resume
    await page.getByRole('button', { name: 'Or paste resume as text' }).click();
    await page.locator('#resume-input').fill('My test resume content.');

    // 4. Add a job and fill in the description
    await page.getByRole('button', { name: '+ Add New Job' }).click();
    await page.locator('[id^=job-desc-]').first().fill('My test job description.');

    // 5. Click the analyze button
    await page.getByRole('button', { name: 'Analyze Match' }).first().click();

    // 6. Assert that a user-friendly error message is displayed in the JobCard
    const expectedErrorMessage = "Error: Failed to get analysis from Gemini API. Please check your API key and the model's availability.";
    await expect(page.locator(`text=${expectedErrorMessage}`)).toBeVisible();
    
    // 7. Assert that the loading state is gone
    await expect(page.locator('button:has-text("Analyze Match")')).toBeEnabled();
  });

});
