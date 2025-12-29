import { Button } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

const App: React.FC = () => {
  return (
    <div>
      <Button variant="filled">Click me</Button>
    </div>
  );
};

export const Route = createFileRoute('/')({
  component: App,
});
