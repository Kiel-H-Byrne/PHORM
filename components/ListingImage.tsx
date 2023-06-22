import { Image } from "@chakra-ui/react";
import { useState } from "react";
import { Listing } from '../db/Types';



const DEFAULT_IMAGE = "http://placeimg.com/89/50/arch";

const ListingImage = ({ image, name, url }: Partial<Listing & Element>) => {
  const [ogImage, setogImage] = useState("");

  // const handleImageError = async (e: GlobalEventHandlers) => {
  //   // modify db to remove the image url for this listing _id
  //   //get opengraph image and save src instead
  //   let img = e;
  //   img.onerror = null;
  //   !url
  //     ? setogImage(DEFAULT_IMAGE)
  //     : await getOG(url).then((data) => setogImage(data));
  // };
  return image ? (
    <Image
      width="100%"
      src={ogImage || image.url}
      // onError={(e) => handleImageError(e)}
      alt={name}
      title={name}
    />
  ) : null;
};

export default ListingImage;
