import { createFileRoute } from '@tanstack/react-router';

function ProgramsHomePage() {
  return <div>Hello programs</div>;
}

export const Route = createFileRoute('/programs/')({
  component: ProgramsHomePage,
});
