import type { INAVLINKS } from "./MyNav";
import { NavLink } from "./NavLink";


export const NavLinks = ({
  links, isLoggedIn,
}: {
  links: INAVLINKS;
  isLoggedIn: boolean;
}) => links.map(({ path, label, isPrivate }) =>
  // display the link if isprivate and isloggedin OR isPrivate false && not loggedIn
  !isPrivate || (isPrivate && isLoggedIn) ? (
    <NavLink key={label} path={path} label={label} />
  ) : null
);
