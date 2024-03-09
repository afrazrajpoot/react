import { cn } from "../../../../lib/utils";
import { Hint } from "../../../../components/hint";

interface ItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

export const Item = ({ id, name, imageUrl }: ItemProps) => {
  const onClick = () => {
    // Handle onClick functionality here
  };

  return (
    <div className="aspect-square relative">
      <Hint label={name} side="right" align="start" sideOffset={18}>
        <img
          alt={name}
          src={imageUrl}
          onClick={onClick}
          className={cn(
            "rounded-md cursor-pointer opacity-75 hover:opacity-100 transition"
          )}
        />
      </Hint>
    </div>
  );
};
