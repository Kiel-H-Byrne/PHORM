import { Card, CardBody, CardFooter, Text } from '@chakra-ui/react';
import { IListing } from '@util/index';
import { memo } from 'react';

interface Props {
  activeListing: IListing
}


const CondensedCard = ({activeListing}:Props) => {
  const {name, /*image, url, description*/} = activeListing;
  return (
    <Card >
      <CardFooter>
        {/* {image && (
          <div >
            <ListingImage image={image} name={name} url={url} />
          </div>
        )} */}
        <CardBody>
          <Text pb={3} as="h6">
            {name}
          </Text>
          {/* {description && (
            <Text variant="body2" color="textSecondary" as="p">
              {description}
            </Text>
          )} */}
        </CardBody>
      </CardFooter>
    </Card>
  );
};
export default memo(CondensedCard)
