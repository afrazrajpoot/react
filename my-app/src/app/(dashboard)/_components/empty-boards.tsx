import { toast } from "sonner";
import { Navigate } from "react-router-dom"; // Import Navigate from React Router DOM
import { api } from "../../../convex/_generated/api";
import { Button } from "../../../components/ui/button";
import { useApiMutation } from "../../../hooks/use-api-mutation";

export const EmptyBoards = () => {
  const { mutate, pending } = useApiMutation(api.board.create);

  const onClick = async () => {
    try {
      // Replace this with your logic to get organization information
      const orgId = "your_organization_id";

      const id = await mutate({
        orgId: orgId,
        title: "Untitled"
      });

      toast.success("Board created");
      return <Navigate to={`/board/${id}`} />; // Use Navigate component for navigation
    } catch (error) {
      toast.error("Failed to create board");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <img
        src="/note.svg"
        height={110}
        width={110}
        alt="Empty"
      />
      <h2 className="text-2xl font-semibold mt-6">
        Create your first board!
      </h2>
      <p className="text-muted-foreground textg-sm mt-2">
        Start by creating a board for your organization
      </p>
      <div className="mt-6">
        <Button disabled={pending} onClick={onClick} size="lg">
          Create board
        </Button>
      </div>
    </div>
  );
};
