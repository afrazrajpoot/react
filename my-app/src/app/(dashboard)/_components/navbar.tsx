// import { 
//   UserButton, 
//   OrganizationSwitcher, 
//   useOrganization
// } from "@clerk/nextjs";

import { SearchInput } from "./search-input";


export const Navbar = () => {
  // const { organization } = useOrganization();

  return (
    <div className="flex items-center gap-x-4 p-5">
      <div className="hidden lg:flex lg:flex-1">
        <SearchInput />
      </div>
      <div className="block lg:hidden flex-1">
        {/* Remove Clerk's OrganizationSwitcher */}
      </div>
      {/* {organization && (
        <InviteButton />
      )}
      <UserButton /> */}
    </div>
  );
};
