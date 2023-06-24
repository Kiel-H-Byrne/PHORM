// import * as firebase from "firebase/app"
// import "firebase/firestore"

import { collection, doc, endAt, getDoc, getDocs, orderBy, query, setDoc, startAt } from "firebase/firestore";
import { distanceBetween, geohashQueryBounds } from "geofire-common";
import { IListing } from "../types";
import { appFsdb } from "./firebase";

const listingsRef = collection(appFsdb, "listings");

// const watchCollection = function(collection, ...filters) {

//   switch(collection) {
//     case "listingS": { collection = listingsCollection; break }
//     default: return
//   }
//   collection
//   // .where(filters[0], == filters[1])
//   .onSnapshot(function(querySnapshot) {
//     //update state with this data...
//     console.log("i'm Watching")
//     querySnapshot
//     .docChanges()
//     .forEach(change => {
//       if (change.type === "added") {
//         let data = change.doc.data();
//         console.log("New listing", change.doc.data())
//         let doc = {}
//         doc[change.doc.id] = data;
//         dispatch({type: ACTIONS.listingS_API_RESULT, payload: doc})
//       }
//       if (change.type === "modified") {
//         console.log("Modified listing", change.doc.data())
//         let data = change.doc.data();

//         //update state (state.listings.byId & state.listings.allIds)
//         // console.log(state.listings.byId)
//         console.log(data)
//         // dispatch({type: ACTIONS.listingS_API_RESULT, payload: {...state.listings.byId, data}})
//       }
//       if (change.type === "removed") {
//         let data = change.doc.data();
//         console.log("Deleted listing", change.doc.data()._id)
//         // dispatch({type: ACTIONS.listingS_API_RESULT, payload: data})
//         //remove listingID from users, services
//       }
//     });
//   });
// };

// const unWatchCollection = function(filter){
//   collection(filter)
//     .onSnapshot(function () {});
// }

// const watchDocument = function(collection, id) {
//   console.log("i'm Watching")
//   switch(collection) {
//     case "listingS": { collection = listingsCollection; break }
//     case "SERVICES": { collection = servicesCollection; break }
//     case "GIFTS": { collection = giftsCollection; break }
//     default: return
//   }
//   collection
//   .doc(id)
//   // .where(filters[0], == filters[1])
//   .onSnapshot({
//     includeMetadataChanges: true
//   },function(docSnapshot) {
//     let doc = {}
//     //update state with this data...
//     doc[docSnapshot.id] = docSnapshot.data();
//     console.log(doc)
//     dispatch({type: ACTIONS.listingS_API_RESULT, payload: doc})
//   });
// };

// const unWatchDocument = function(filter, id){
//   collection(filter)
//     .doc(id)
//     .onSnapshot(function () {});
// }

// == LISTINGS == //

const listingCreate = async function (data: IListing) {
  const docRef = doc(listingsRef);
  return await setDoc(docRef, {...data}, { merge: true });
};

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
//       .collection("listingS")
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

export { getListingsWithinRadius, listingCreate, listingsDelete, listingsFetch };

