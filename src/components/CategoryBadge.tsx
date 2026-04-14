import { TaskCategory } from '@/types';

const categoryLabels: Record<TaskCategory, string> = {
  testing: 'Testing',
  research: 'Research',
  content: 'Content',
  community: 'Community',
  data: 'Data',
  design: 'Design',
};

const CategoryBadge = ({ category }: { category: TaskCategory }) => (
  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
    {categoryLabels[category]}
  </span>
);

export default CategoryBadge;
