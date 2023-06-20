export interface GLocation { lat: number, lng: number }

export interface PullUp {
  _id: any;
  pid: string;
  uid: string;
  userName: string;
  message: string;
  location: GLocation;
  timestamp: string;
  media?: {
    uri: string,
    fileName: string,
    height: number,
    width: number,
    duration: number,
    bytes: number,
    type: string,
    thumbnailUri: string,
  };
}