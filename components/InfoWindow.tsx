import React from "react";
import { InfoWindow } from "@react-google-maps/api";
import { GLocation, PullUp } from "../types";
import { Box, Flex, Image, Progress, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
// import { useSession } from "next-auth/client";
import { RenderMedia } from "./RenderMedia";

const MyInfoWindow = ({ activeData, clusterCenter }: { activeData: PullUp[], clusterCenter: GLocation }) => {
  const options = {
    pixelOffset: { height: -40, width: 0, equals: undefined },
    disableAutoPan: true,
    position: clusterCenter
  }
  // const hasNoData = !activeData || activeData.length == 0
  const hasOneItem = activeData.length && activeData.length == 1
  // console.log("infowindow fired")
  // console.log(activeData, hasOneItem)
  // const [session, loading] = useSession()
  return (

    hasOneItem ? <SingleInfoContent data={activeData} options={options} /> : <MultipleInfoContent data={activeData} options={options} />
  )
}


export default React.memo(MyInfoWindow);

const SingleInfoContent = ({ data, options }: { data: PullUp[], options: any }) => {
  const { location, userName, media, message } = data[0];
  return (
    <InfoWindow
      position={location}
      options={options}
    >
      <Flex width="xs" direction="column">
        {media && <RenderMedia media={media} options={{
          title: message.substr(0, 11),
          thumbOnly: true
        }} />}
        <Text as="h2">{message}</Text>
        <Text fontWeight="light" fontSize=".7rem" color="gray.300">{userName} </Text>
      </Flex>
    </InfoWindow>);
}

const MultipleInfoContent = ({ data, options }: { data: PullUp[], options: any }) => {
  const { position }: { position: GLocation } = options;
  return (
    <InfoWindow
      position={position}
      options={options}
    >
      <Box>
        {data.map(el => {
          const { media, message, userName } = el;
          return (
            <Flex width="xs" direction="column">
              <Flex maxHeight="100px" direction="row" marginBlock={1} border="1px solid red" borderRadius={7}>
                {media && <Box>
                  <Image maxH="100px" src={media.thumbnailUri} title={message.substr(0, 11)} borderRadius={7} />
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