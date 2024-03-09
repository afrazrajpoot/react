import { useState } from 'react'; // Import useState from React

import { EmptyOrg } from "./_components/empty-org";
import { BoardList } from "./_components/board-list";

interface DashboardPageProps {
  searchParams: {
    search?: string;
    favorites?: string;
  };
};

const DashboardPage = ({
  searchParams,
}: DashboardPageProps) => {
  // Simulate organization state
  const [organization] = useState<{ id: string } | null>(null);

  return ( 
    <div className="flex-1 h-[calc(100%-80px)] p-6">
      <h1>Afraz Bhatti</h1>

      {!organization ? (
        <EmptyOrg />
      ) : (
        <BoardList
          orgId={organization.id}
          query={searchParams}
        />
      )}
    </div>
   );
};
 
export default DashboardPage;
