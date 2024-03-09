import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Navigate } from "react-router-dom"; // Import Navigate from React Router DOM

// import { cn } from "@/lib/utils";
import { cn } from "../../../lib/utils";
// import { api } from "@/convex/_generated/api";
import { api } from "../../../convex/_generated/api";
// import { useApiMutation } from "@/hooks/use-api-mutation";
import { useApiMutation } from "../../../hooks/use-api-mutation";

interface NewBoardButtonProps {
  orgId: string;
  disabled?: boolean;
}

export const NewBoardButton = ({
  orgId,
  disabled,
}: NewBoardButtonProps) => {
  const { mutate, pending } = useApiMutation(api.board.create);

  const onClick = async () => {
    try {
      const id = await mutate({
        orgId,
        title: "Untitled"
      });

      toast.success("Board created");
      // Instead of directly navigating, return Navigate component
      return <Navigate to={`/board/${id}`} replace />;
    } catch (error) {
      toast.error("Failed to create board");
    }
  };

  return (
    <button
      disabled={pending || disabled}
      onClick={onClick}
      className={cn(
        "col-span-1 aspect-[100/127] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6",
        (pending || disabled) && "opacity-75 hover:bg-blue-600 cursor-not-allowed"
      )}
    >
      <div />
      <Plus className="h-12 w-12 text-white stroke-1" />
      <p className="text-sm text-white font-light">
        New board
      </p>
    </button>
  );
};
