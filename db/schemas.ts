import * as z from 'zod';


const ProfileSchema = z.object({
  firstName: z.string({}),
  lastName: z.string(),
  email: z.string().email(),
  social: z.object({

    facebook: z.string(),
    instagram: z.string(),
    twitter: z.string(),
  }),
    ownedListings: z.array(z.string()),
  verifiedListings: z.array(z.string()),
  deverifiedListings: z.array(z.string()),
  favorites: z.array(z.string()),
})

const UserSchema = z.object({
  // For accounts-password, either emails or username is required, but not both. It is OK to make this
  // optional here because the accounts-password package does its own validation.
  // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
    username: z.string(),
    // For accounts-password, either emails or username is required, but not both. It is OK to make this
    // optional here because the accounts-password package does its own validation.
    // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
    emails:  z.string().email(),
    "emails.$": z.object({address: z.string().email(), verified: z.boolean()}),
    // Use this registered_emails field if you are using splendido:meteor-accounts-emails-field / splendido:meteor-accounts-meld
    registered_emails: z.array(z.string().email()),
    createdAt: z.date(),
    profile: ProfileSchema,
    // Make sure this services field is in your schema if you're using any of the accounts packages
    // services: z.object(),
    // Add `roles` to your schema if you use the meteor-roles package.
    // Option 1: z.object() type
    // If you specify that type as Object, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Example:
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    // roles: {
    //     type: z.object(),
    //     blackbox: true
    // Option 2: z.array(z.string()) type
    // If you are sure you will never need to use role groups, then
    // you can specify z.array(z.string()) as the type
    roles: z.array((z.string())),
});

;

const OwnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(  ),
  email: z.string().email(),
});

// const UserSchema= z.object({
//   id: z.string(),
//   name: z.string(),
// })

const SocialSchema = z.object({
  facebook: z.string(),
    instagram: z.string(),
    twitter: z.string(),
});

const ListingsSchema = z.object({

  // We use `label` to put a custom label for this form field
  // Otherwise it would default to `Title`
  // 'optional: false' means that this field is required
  // If it's blank, the form won't submit and you'll get a red error message
  // 'type' is where you can set the expected data type for the 'title' key's value
  name: z.string(),
  address: z.string(),

  street: z.string(),
    
  city: z.string(),
  state: z.string(),
    
  zip: z.number(),
  country: z.string(),
  phone: z.string(),
  url: z.string().url(),
  // "claims.$.ownerId": z.string(),
  // "claims.$.ownerName": z.string(),
  // "claims.$.ownerPhone": z.string(),
  // "claims.$.ownerProof": orion.attribute('file', {
  // }),  
  claimsCount: z.number(),
  location: z.string(),
    // autoValue: function () {
    //   if (this.field("address").value || this.field("street").value) {
    //     let address = this.field("address").value;
    //     let street = this.field("street").value;
    //     // let name = this.field("name").value;
    //     let addressString;
    //     if (address) {
    //       addressString = address;
    //     } else if (street) {
          
    //       // console.log(this.docId);
    //       // console.log(this);
    //       // params.place_id = this.field("google_id").value;

    //       let city = this.field("city").value;
    //       let zip = this.field("zip").value;
    //       let state = this.field("state").value ;
    //     } 
    //     // console.log(addressString);
    //     const response = Meteor.call('geoCode', addressString);

    //     if (response && response.results.length) {
    //       // console.log(response.results[0].address_components);
    //       const loc = response.results[0].geometry.location;
    //       // console.log("GOOGLE TYPES:") ;
    //       // console.log(response.results[0].types);
    //       // this.field("google_id").value = place_id;

    //       //====== RETURN LAT/LONG OBJECT LITERAL ======
    //       // return loc;
    //       //====== RETURN STRINGIFIED LAT/LONG NUMBERS ======
    //       const arr =  _.values(loc);
    //       // console.log(arr.toLocaleString());
    //       const locationString = arr.toLocaleString();
    //       // console.log(name, locationString);
    //       //NOW THAT I HAVE LOCATION, DO A GOOGLE PLACES SEARCH TO DETERMINE PLACES_ID
    //       // Meteor.call('placesSearch', name, locationString);

    //       return locationString;
    //     } 
      // }
    // }

  description: z.string(),

  google_id:  z.string(),
  yelp_id:  z.string(),
  email: z.string(),
  categories: z.array(z.string()),
  social: SocialSchema,
  // creator: orion.attribute('createdBy'),
  // submitted: orion.attribute('createdAt'),
});

