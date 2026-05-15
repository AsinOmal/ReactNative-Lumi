import React from 'react';
import { Construction } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';

interface PlaceholderScreenProps {
  title: string;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  title,
}) => (
  <EmptyState
    icon={<Construction size={40} />}
    title={`${title} — Coming in Phase 9b/9c`}
    description="This section is being built. Check the development plan for the timeline."
  />
);
