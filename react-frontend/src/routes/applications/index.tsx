import { createFileRoute } from '@tanstack/react-router';

function ApplicationsHomePage() {
  return <div>Hello "/applications/"!</div>;
}

export const Route = createFileRoute('/applications/')({
  component: ApplicationsHomePage,
});
