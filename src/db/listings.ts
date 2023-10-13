// import * as firebase from "firebase/app"
// import "firebase/firestore"

import { IListing } from "@util/index";
import { collection, doc, endAt, getDoc, getDocs, orderBy, query, setDoc, startAt } from "firebase/firestore";
import { distanceBetween, geohashQueryBounds } from "geofire-common";
import { appFsdb } from "./firebase";

const listingsRef = collection(appFsdb, "listings");

// == LISTINGS == //

const listingCreate = async function (data: IListing) {
  const docRef = doc(listingsRef);
  return await setDoc(docRef, {...data}, { merge: true });
};

const listingsFetchAll = async function () {
  console.log("Fetching doc", new Date())
    const querySnapshot = await getDocs(listingsRef);
    const listings: IListing[] = [];
    querySnapshot?.forEach((doc) => {
      listings.push(doc.data() as IListing);
    });
    return listings;
  
}
const listingsFetch = async function (query: any) {
  const docRef = doc(listingsRef, query);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return [];
};

const getListingsWithinRadius = async (
  radiusInM: number,
  center: [number, number]
) => {
  const bounds = geohashQueryBounds(
    center,
    radiusInM
  );
  const promises = [];
  for (const bound of bounds) {
    const q = query(
      collection(appFsdb, "listings"),
      orderBy("geoHash"),
      startAt(bound[0]),
      endAt(bound[1]),
    );
    promises.push(getDocs(q));
  }

  const snapShots = await Promise.all(promises);
  const listings = snapShots
    .flatMap((snapShot) => snapShot.docs)
    .map((doc) => doc.data());

    const filteredListings = listings.filter(({lat,lng}) => {
      const distanceInM = distanceBetween(
        [lat, lng],
        center
      );
      return distanceInM <= radiusInM;
    });
    
  return listings;
};

const listingsDelete = function (uid: string) {};

// export const getMylistings = (uid, dispatch) => {
//   // eslint-disable-next-line
//   let listingsRef;

//   return Object.keys(mylistingIds).forEach(listingId => {
//     return (listingsRef = fsdb
//       .collection("listings")
//       .doc(`${listingId}`)
//       .get()
//       .then(doc => {
//         dispatch({
//           type: UPDATE_MY_listingS,
//           payload: doc.data()
//         });

//         //Watching dlistings
//         watchMylistings({ uid: uid, dispatch, listingId });
//       }));
//   });
// };

export { getListingsWithinRadius, listingCreate, listingsDelete, listingsFetch, listingsFetchAll };



