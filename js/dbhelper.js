//import idb from 'idb'
/**
 * Common database helper functions.
 */
var dbPromise;
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants/`;
  }
  static openDatabase() {
    return idb.open("Restaurant Reviews", 5, upgradeDBObject => {
      switch (upgradeDBObject.oldVersion) {
        case 0:
          upgradeDBObject.createObjectStore("restaurants", {
            keyPath: "id"
          });
        case 1:
          upgradeDBObject.createObjectStore("restaurant-reviews", {
            keyPath: "id"
          });
        case 2:
          upgradeDBObject.createObjectStore("outbox", {
            autoIncrement: true,
            keyPath: "id"
          });
        case 2:
          upgradeDBObject.createObjectStore("favorite", {
            autoIncrement: true,
            keyPath: "id"
          });
      }
    });
  }
  //OLD Version
  // static openDatabase() {
  //   return idb.open('restaurants' , 1  , function(upgradeDb) {
  //     upgradeDb.createObjectStore('restaurants' ,{keyPath: 'id'});
  //   });
  // }
  static getCachedMessages() {
    dbPromise = DBHelper.openDatabase();
    return dbPromise.then(function(db) {
      //if we showing posts or very first time of the page loading.
      //we don't need to go to idb
      if (!db) return;

      var tx = db.transaction("restaurants");
      var store = tx.objectStore("restaurants");

      return store.getAll();
    });
  }
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.getCachedMessages().then(function(data) {
      // if we have data to show then we pass it immediately.
      if (data.length > 0) {
        return callback(null, data);
      }

      // After passing the cached messages.
      // We need to update the cache with fetching restaurants from network.
      fetch(DBHelper.DATABASE_URL, { credentials: "same-origin" })
        .then(res => {
          return res.json();
        })
        .then(data => {
          dbPromise.then(function(db) {
            if (!db) return db;

            var tx = db.transaction("restaurants", "readwrite");
            var store = tx.objectStore("restaurants");

            data.forEach(restaurant => store.put(restaurant));

            // limit the data for 30
            store
              .openCursor(null, "prev")
              .then(function(cursor) {
                return cursor.advance(30);
              })
              .then(function deleteRest(cursor) {
                if (!cursor) return;
                cursor.delete();
                return cursor.continue().then(deleteRest);
              });
          });
          return callback(null, data);
        })
        .catch(err => {
          return callback(err, null);
        });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // ** Using fetch API *** //
    fetch(`${DBHelper.DATABASE_URL}${id}`)
      .then(response => {
        if (response) {
          return response.json();
        }
      })
      .then(json => callback(null, json))
      .catch(err =>
        callback(
          `Request failed. Returned status of ${err.code}. ${err.message}`,
          null
        )
      );
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/${restaurant.photograph}.jpg`;
  }

  static imageSetUrlForRestaurant(restaurant) {
    return `/images/${restaurant.id}-small.jpg 480w , /images/${
      restaurant.id
    }-large.jpg 1024w`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, newMap) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker(
      [restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: `Localisation of ${restaurant.name} restaurant`,
        url: DBHelper.urlForRestaurant(restaurant),
        id: `marker-${restaurant.id}`
      }
    );
    marker.addTo(newMap);
    return marker;
  }

  static fetchReviewsForRestaurant(id, callback) {
    fetch("http://localhost:1337/reviews/?restaurant_id=" + id)
      .then(response => {
        if (response.status === 200) {
          response
            .json()
            .then(json => {
              callback(null, json);
            })
            .catch(err => {
              callback(err, null);
            });
        } else {
          callback(
            `Request failed. Returned status of ${response.status}`,
            null
          );
        }
      })
      .catch(err => {
        callback(err, null);
      });
  }
}
