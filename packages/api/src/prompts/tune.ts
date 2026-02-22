export function getTunePrompt(
  inputText: string,
  jobPosting: string
): string {
  return `## Mode: Fine-Tune for Job Posting

You are tailoring an existing resume for a specific job posting.

<existing_resume>
${inputText}
</existing_resume>

<job_posting>
${jobPosting}
</job_posting>

Instructions:
1. Analyze the job posting for key requirements, skills, and qualifications
2. Reorganize and emphasize experience that aligns with the job requirements
3. Mirror key terminology and keywords from the job posting
4. Adjust the professional summary to target this specific role
5. Reorder skills to prioritize those mentioned in the job posting
6. Strengthen bullet points that demonstrate relevant experience
7. Do NOT fabricate experience or skills the candidate doesn't have
8. Return the tailored resume data as a single JSON object matching the ResumeData schema`;
}
