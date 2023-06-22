import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { InfoWindow } from "@react-google-maps/api";
import React from "react";
import { GLocation, IListing } from "../types";


const MyInfoWindow = ({ activeData, clusterCenter }: { activeData: IListing[], clusterCenter: GLocation }) => {
  const options = {
    pixelOffset: { height: -40, width: 0, equals: undefined },
    disableAutoPan: true,
    position: clusterCenter
  }
  // const hasNoData = !activeData || activeData.length == 0
  const hasOneItem = activeData.length && activeData.length == 1
  // console.log("infowindow fired")
  // console.log(activeData, hasOneItem)
  
  return (

    hasOneItem ? <SingleInfoContent data={activeData} options={options} /> : <MultipleInfoContent data={activeData} options={options} />
  )
}


export default React.memo(MyInfoWindow);

const SingleInfoContent = ({ data, options }: { data: IListing[], options: any }) => {
  const { location, userName, media, message } = data[0];
  return (
    <InfoWindow
      position={location}
      options={options}
    >
      <Flex width="xs" direction="column">

        <Text as="h2">{message}</Text>
        <Text fontWeight="light" fontSize=".7rem" color="gray.300">{userName} </Text>
      </Flex>
    </InfoWindow>);
}

const MultipleInfoContent = ({ data, options }: { data: IListing[], options: any }) => {
  const { position }: { position: GLocation } = options;
  return (
    <InfoWindow
      position={position}
      options={options}
    >
      <Box>
        {data.map(({ media, message, userName }) => {
          return (
            <Flex key={userName} width="xs" direction="column">
              <Flex maxHeight="100px" direction="row" marginBlock={1} border="1px solid red" borderRadius={7}>
                {media && <Box>
                  <Image maxH="100px" src={media.thumbnailUri} title={message.substr(0, 11)} borderRadius={7} alt="Thumbnail"/>
                </Box>
                }
                <Box p={2}>
                  <Text fontWeight="semibold" fontSize={13}>{message}</Text>
                  <Text fontWeight="light" fontSize=".7rem" color="gray.300">@{userName} </Text>
                </Box>
              </Flex>
            </Flex>
          )
        })}
      </Box>
    </InfoWindow>
  )
}