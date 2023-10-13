import {
  Button,
  Container,
  Divider,
  Drawer,
  Grid,
  Text
} from "@chakra-ui/react";
import { IListing } from '@util/index';
import { MdDirections } from "react-icons/md";

interface ISideDrawer {
  activeListing: IListing;
  isOpen: boolean;
  onClose: () => void;
  mapInstance: any;
  onOpen: () => void
}

const SideGrid = ({activeListing}: { activeListing: IListing }) => {
  const { name, /*url, image, description, phone, address*/ } = activeListing;
  return (
    <Container >
      {/* <a
        href={url}
        title="Listing Image"
        rel="noopener noreferrer"
        target="blank"
      >
        <ListingImage
          image={image}
          name={name}
          url={url}
          className="listing-image"
        />
      </a> */}
      <Divider />
      <Grid>
        <article className="card-title">
          <Text variant="h3">{name}</Text>
          {/* <Text variant="overline">{description}</Text> */}
          <address className="card-content">
            {/* <a href={`tel:${phone}`}>{phone}</a> */}
            {/* <Text variant="body1">{address}</Text> */}
          </address>
        </article>
        <div>Hours if</div>
        <Button color="primary" className="button_get-directions">
          <MdDirections />
        </Button>
      </Grid>
      <Divider />
      <Grid className="inline-list actionBar">MoBB Actions </Grid>
      <Divider />
      <Grid>MoBB Actions</Grid>
      <Divider />
      <Grid>Photos if</Grid>
      <Grid>Reviews if</Grid>
    </Container>
  );
};

const SideDrawer = ({
  activeListing,
  isOpen,
  onClose,
  mapInstance,
}: ISideDrawer) => {

  /*
address: "2729 Piatt St, Wichita, KS 67219"
categories: ["Health & Wellness"]
country: "US"
creator: "THQMGTjrvtYww8MvA"
description: "Want to help others make Total Life Changes?"
image: {url: "https://shop.totallifechanges.com/Content/images/Logos/footerlogo.png"}
location: "37.7332579,-97.3121848"
name: "Independent Total Life Changes Distributor"
phone: "3163904404"
submitted: {$date: "2017-09-04T22:49:18.696Z"}
url: "http://www.totallifechanges.com/6923871"
_id: "3Nh99P2JxxCpBGm5v"
*/

  return (
    <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
      {/* <SideList activeListing={activeListing} mapInstance={mapInstance} /> */}
      {/* <LegacyDrawer activeListing={activeListing} /> */}
      <SideGrid activeListing={activeListing} />
    </Drawer>
  );
};

// const sliderPhoto = (photo) => {};
// const openHours = () => true;
// const verifyUI = () => {};
// const authUser = () => true;
// const isOwner = () => false;

export default SideDrawer;

/* <CarouselPhoto >
  <div class="place_photo carousel-item" style="background-image: url({getImgUrl photo_reference})">
    <img alt="image" src="/img/transparent.png" alt=""/>
  </div>
</CarouselPhoto>

<CarouselPhoto2 >
  <a class="place_photo carousel-item" style="">
    <img alt="image" src="{this}" />
  </a>
</CarouselPhoto2>

<SliderPhoto >
  <li>
        <img alt="image" src="{getImgUrl photo_reference}" />

  </li>  
</SliderPhoto> */
