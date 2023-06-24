import { Box, Flex, Text } from "@chakra-ui/react";
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
  const { lat,lng,name, } = data[0];
  if (lat && lng) {
    return (
      <InfoWindow
      position={{lat,lng}}
      options={options}
      >
      <Flex width="xs" direction="column">

        <Text as="h2">{name}</Text>
        <Text fontWeight="light" fontSize=".7rem" color="gray.300">---Description--- </Text>
      </Flex>
    </InfoWindow>)}
}

const MultipleInfoContent = ({ data, options }: { data: IListing[], options: any }) => {
  const { position }: { position: GLocation } = options;
  return (
    <InfoWindow
      position={position}
      options={options}
    >
      <Box>
        {data.map(({ name }) => {
          return (
            <Flex key={name} width="xs" direction="column">
              <Flex maxHeight="100px" direction="row" marginBlock={1} border="1px solid red" borderRadius={7}>
                <Box p={2}>
                  <Text fontWeight="semibold" fontSize={13}>{name}</Text>
                  <Text fontWeight="light" fontSize=".7rem" color="gray.300">==Description==</Text>
                </Box>
              </Flex>
            </Flex>
          )
        })}
      </Box>
    </InfoWindow>
  )
}