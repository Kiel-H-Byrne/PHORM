import { PullUp } from "../types";

export const mockShouts: PullUp[] = [{
  _id: "gibberish001",
  pid: "",
  uid: "ugibberish001",
  userName: "roMancerRocker",
  message: "Love it here!",
  location: { lat: 0, lng: 0 },
  timestamp: new Date().toString(),
  media: {
    uri: "",
    fileName: "sample-vid",
    thumbnailUri: "",
    height: 480,
    width: 640,
    duration: 0,
    bytes: 0,
    type: "video",
  },
}]