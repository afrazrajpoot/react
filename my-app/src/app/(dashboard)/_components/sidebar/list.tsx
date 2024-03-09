import { Item } from "./item";
type Organization = any;
export const List = () => {
  // Remove useOrganizationList hook
  
  // Assuming userMemberships is an array of organizations
  const userMemberships: Organization[] = []; // Replace 'Organization' with the actual type of organization; // Placeholder, replace it with your actual data source

  if (!userMemberships.length) return null;
  
  return (
    <ul className="space-y-4">
      {userMemberships.map((mem:any) => (
        <Item
          key={mem.id} // Assuming id is available directly in the organization object
          id={mem.id}
          name={mem.name}
          imageUrl={mem.imageUrl}
        />
      ))}
    </ul>
  );
};
