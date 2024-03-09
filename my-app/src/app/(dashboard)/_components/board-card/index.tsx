import { toast } from "sonner";
import { NavLink } from "react-router-dom"; // Import NavLink from react-router-dom
// import { MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { api } from "../../../../convex/_generated/api";
import { Actions } from "../../../../components/actions";
import { Skeleton } from "../../../../components/ui/skeleton";
import { useApiMutation } from "../../../../hooks/use-api-mutation";

import { Footer } from "./footer";
import { Overlay } from "./overlay";

interface BoardCardProps {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  createdAt: number;
  imageUrl: string;
  orgId: string;
  isFavorite: boolean;
};

export const BoardCard = ({
  id,
  title,
  authorId,
  authorName,
  createdAt,
  imageUrl,
  orgId,
  isFavorite,
}: BoardCardProps) => {
  const {
    mutate: onFavorite,
    pending: pendingFavorite,
  } = useApiMutation(api.board.favorite);
  const {
    mutate: onUnfavorite,
    pending: pendingUnfavorite,
  } = useApiMutation(api.board.unfavorite);

  const toggleFavorite = () => {
    if (isFavorite) {
      onUnfavorite({ id })
        .catch(() => toast.error("Failed to unfavorite"))
    } else {
      onFavorite({ id, orgId })
        .catch(() => toast.error("Failed to favorite"))
    }
  };

  const authorLabel = authorName; // Remove userId check
  const createdAtLabel = formatDistanceToNow(createdAt, {
    addSuffix: true,
  });

  return (
    <NavLink to={`/board/${id}`}> {/* Replace Link with NavLink */}
      <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden">
        <div className="relative flex-1 bg-amber-50">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full"
          />
          <Overlay />
          <Actions
            id={id}
            title={title}
            side="right"
          >
            <button
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 outline-none"
            >
              {/* <MoreHorizontal
                className="text-white opacity-75 hover:opacity-100 transition-opacity"
              /> */}
            </button>
          </Actions>
        </div>
        <Footer
          isFavorite={isFavorite}
          title={title}
          authorLabel={authorLabel}
          createdAtLabel={createdAtLabel}
          onClick={toggleFavorite}
          disabled={pendingFavorite || pendingUnfavorite}
        />
      </div>
    </NavLink>
  );
};

BoardCard.Skeleton = function BoardCardSkeleton() {
  return (
    <div className="aspect-[100/127] rounded-lg overflow-hidden">
      <Skeleton className="h-full w-full" />
    </div>
  );
};
