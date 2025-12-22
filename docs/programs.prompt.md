Revise the post-login flow for applicants as follows:

1. Replace the `/student/dashboard` route with `/applications/index.vue` to accurately reflect user roles.
2. Ensure routing consistency by standardizing application detail URLs to `/applications/:applicationId` instead of `/programs/:programId/applications/:applicationId`.
3. Update the application initiation email to include a direct login URL for applicants to access their dashboard.
4. Review and streamline the entire applicant journey from login to application completion for clarity and ease of use.
5. Ensure all UI components and navigation elements reflect these changes for a cohesive user experience.

Refer to https://www.nngroup.com/articles/ten-usability-heuristics/ for usability best practices.
