import { SearchIcon } from "@chakra-ui/icons";
import {
    Button,
    Divider,
    HStack,
    IconButton,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useDisclosure
} from "@chakra-ui/react";
import { GoogleMapProps } from "@react-google-maps/api";
import { Dispatch, SetStateAction, memo, useState } from "react";
// import { Category, Listing } from "../../db/Types";
import { IListing, targetClient } from "@util/index";
// import CategoryFilter from "./CategoryFilter";
import LocateMeButton from "./LocateMeButton";

interface OwnProps {
  listings: IListing[];
  categories: string[];
  selectedCategories: Set<string>;
  mapInstance: GoogleMapProps;
  clientLocation?: any;
  setClientLocation?: () => any;
  setSelectedCategories: Dispatch<SetStateAction<Set<string>>>;
  setactiveListing: Dispatch<SetStateAction<Set<IListing>>>;
  setisDrawerOpen: Dispatch<SetStateAction<Boolean>>;
}

const useStyles = {
  input: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    padding: ".5rem",
  },
  divider: {
    width: 1,
    height: 28,
    margin: 3,
    verticalAlign: "",
  },
  // hideDesktop: {
  //   flexShrink: 1,
  //   [theme.breakpoints.up("sm")]: {
  //     display: "none",
  //   },
  // },
  // hideMobile: {
  //   // flexGrow: 1,
  //   [theme.breakpoints.down("xs")]: {
  //     display: "none",
  //   },
  // },
};

const MapAutoComplete = ({
  listings,
  //   categories,
  //   selectedCategories,
  mapInstance,
  //   clientLocation,
  setClientLocation,
  setSelectedCategories,
  setactiveListing,
  setisDrawerOpen,
}: OwnProps) => {
  let count = listings?.length ?? 0;
  const [active, setActive] = useState(0);
  const [filtered, setFiltered] = useState<IListing[]>([]);
  const [input, setInput] = useState("");
  const {isOpen, onToggle, onClose} = useDisclosure()

  const handleChange = (e: any) => {
    const input = e.currentTarget.value;
    if (input) {
onToggle()
      const newFilteredSuggestions =
        input.length > 2
          ? listings?.filter(
              (listing) =>
                listing.name?.toLowerCase().indexOf(input.toLowerCase()) !== -1
            )
          : [];
      setActive(0);
      setFiltered(newFilteredSuggestions);
      setInput(e.currentTarget.value);
    }
  };

  const onClick = (e: any) => {
    //find the tabindex and pass it to setActive
    let index = e.currentTarget.tabIndex;
    setActive(index);
    setFiltered([]);
    setInput("");
    //pan map to location and open sidebar
    let location = filtered[active].location?.split(",");
    let locationObj = location && {
      lat: Number(location[0]),
      lng: Number(location[1]),
    };
    location && targetClient(mapInstance, locationObj);
    setactiveListing(filtered[index]);
    setisDrawerOpen(true);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      console.log("hit enter key");
      setActive(0);
      setInput(filtered[active]);
    } else if (e.key === "ArrowUp") {
      return active === 0 ? null : setActive(active - 1);
    } else if (e.key === "ArrowDown") {
      return active - 1 === filtered.length ? null : setActive(active + 1);
    }
  };
  return (
    <HStack>
      <Menu isOpen={isOpen} closeOnBlur={false}>
          <Input
            placeholder={`Search ${count ? count + " " : ""}Listings...`}
            aria-label={"Search The MOBB"}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            value={input}
          />
          <MenuButton />
        <MenuList maxHeight={"60%"} maxWidth={"auto"} overflowY={"scroll"}>
          {filtered?.length > 0 ? (
            filtered.map((listing, index) => {
              let className;
              if (index === active) {
                className = "active";
              }
              return (
                <MenuItem
                  className={className}
                  key={listing._id}
                  onClick={onClick}
                  tabIndex={index}
                >
                  {listing.name}
                </MenuItem>
              );
            })
          ) : input.length > 2 ? (
            <MenuItem onClick={(e) => e.preventDefault()}>
              Not Found... <Button>Add One!</Button>
            </MenuItem>
          ) : (
            <MenuItem>{`Enter ${3 - input.length} more character(s)`}</MenuItem>
          )}
        </MenuList>
      </Menu>

      <IconButton aria-label="Search" size="large">
        <SearchIcon />
      </IconButton>
      <IconButton aria-label="Add" size="large">
        Add Location
      </IconButton>
      <Divider />
      {/* <CategoryFilter
        listings={listings}
        categories={categories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        aria-label="Filter"
        
      /> */}
      <Divider />
      <LocateMeButton
        mapInstance={mapInstance}
        setClientLocation={null}
        clientLocation={null}
      />
    </HStack>
  );
};

export default memo(MapAutoComplete);
