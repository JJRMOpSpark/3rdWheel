const axios = require('axios');

const restCategories = () => {
  const options = {
    method: 'get',
    url: 'https://api.yelp.com/v3/categories',
    headers: { 'Authorization': `Bearer NvKYKbQMrWoA-t6GjdvKF5BCVYnSYfkAjVcfujslxF2o8LmrHLDQudMMqgyKylzs4m0TCz_wIvO7oQ7wFqqdjaOntDXlEhXjI73b1yM9I3d6CWnhhuP0QhQ2FPVBXnYx` },
  };

  return axios(options)
    .then((response) => {
      const { categories } = response.data;
      const filteredCategories = categories.filter((category) => {
        return category.parent_aliases.includes('restaurants');
      });
      return filteredCategories.map(parentAlias => ({
        name: parentAlias.title,
        alias: parentAlias.alias,
      }));
    })
    .catch((err) => {
      console.error(`category error: ${err}`);
    });
};

const fetchRestaurant = async (category, latitude, longitude) => {
  const { alias } = category;
  const options = {
    method: 'get',
    url: 'https://api.yelp.com/v3/businesses/search',
    headers: {
      'Authorization': `Bearer NvKYKbQMrWoA-t6GjdvKF5BCVYnSYfkAjVcfujslxF2o8LmrHLDQudMMqgyKylzs4m0TCz_wIvO7oQ7wFqqdjaOntDXlEhXjI73b1yM9I3d6CWnhhuP0QhQ2FPVBXnYx`,
    },
    params: {
      categories: alias,
      latitude,
      longitude,
    },
  };
  const response = await axios(options);
  const { businesses } = response.data;
  return businesses[0];
};

//  This function will find the distance between two coordinates
//  It expects arrays of [longitude, latitude]
const haversineDistance = (coords1, coords2) => {
  const toRadians = x => x * Math.PI / 180;

  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const R = 6371;

  const x1 = lat2 - lat1;
  const x2 = lon2 - lon1;
  const dLat = toRadians(x1);
  const dLon = toRadians(x2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2))
    * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const topInterest = (interests) => {
  const orderedInterests = interests
    .map(interest => interest.categoryId)
    .reduce((interestSums, interest) => {
      if (interestSums[interest] === undefined) {
        interestSums[interest] = 0;
      }
      interestSums[interest]++;
      return interestSums;
    }, {});
  const topMatch = Object.keys(orderedInterests)
    .sort((a, b) => orderedInterests[b] - orderedInterests[a])[0];
  return topMatch;
};

const restDecider = async (filter, latitude, longitude) => {
  try {
    const options = {
      method: 'get',
      url: 'https://api.yelp.com/v3/businesses/search',
      headers: {
        Authorization: `Bearer NvKYKbQMrWoA-t6GjdvKF5BCVYnSYfkAjVcfujslxF2o8LmrHLDQudMMqgyKylzs4m0TCz_wIvO7oQ7wFqqdjaOntDXlEhXjI73b1yM9I3d6CWnhhuP0QhQ2FPVBXnYx`,
      },
      params: {
        limit: '5',
        categories: filter,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      },
    };
    const response = await axios(options);
    const { businesses } = response.data;
    return businesses;
  } catch (err) {
    console.error(`Failed to fetch from Yelp: ${err}`);
    return err;
    // franco was here
  }
};


module.exports = {
  restCategories,
  fetchRestaurant,
  haversineDistance,
  topInterest,
  restDecider,
};
