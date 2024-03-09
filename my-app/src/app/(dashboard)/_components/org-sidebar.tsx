import { Link, useSearchParams } from "react-router-dom"; // Import useSearchParams from react-router-dom

import { LayoutDashboard, Star } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

export const OrgSidebar = () => {
  const [searchParams] = useSearchParams(); // Destructure searchParams from useSearchParams

  const favorites = searchParams.get("favorites");

  return (
    <div className="hidden lg:flex flex-col space-y-6 w-[206px] pl-5 pt-5">
      <Link to="/">
        <div className="flex items-center -mt-[0.7vw]">
          <img
            src="/logo.png"
            alt="Logo"
            height={60}
            width={60}
          />
          <span className={cn("font-semibold text-xl")}>
            RapidCanvas
          </span>
        </div>
      </Link>

      <div className="space-y-1 w-full">
        <Button
          variant={favorites ? "ghost" : "secondary"}
          asChild
          size="lg"
          className="font-normal justify-start px-2 w-full"
        >
          <Link to="/">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Team boards
          </Link>
        </Button>
        <Button
          variant={favorites ? "secondary" : "ghost"}
          asChild
          size="lg"
          className="font-normal justify-start px-2 w-full"
        >
          <Link to={{
            pathname: "/",
            search: "?favorites=true" // Set search parameters directly in Link
          }}>
            <Star className="h-4 w-4 mr-2" />
            Favorite boards
          </Link>
        </Button>
      </div>
    </div>
  );
};
