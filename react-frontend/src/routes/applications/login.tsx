import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/applications/login')({
  component: ApplicantLogin,
});

function ApplicantLogin() {
  return <div>Hello "/applicant/login"!</div>;
}
