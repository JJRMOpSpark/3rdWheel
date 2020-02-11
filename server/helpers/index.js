const axios = require('axios');

const fetchRestaurants = async (categoriesArray, latitude, longitude) => {
  try {
    const categories = categoriesArray.join(',');
    const options = {
      method: 'get',
      url: 'https://api.yelp.com/v3/businesses/search',
      headers: {
        'Authorization': `Bearer NvKYKbQMrWoA-t6GjdvKF5BCVYnSYfkAjVcfujslxF2o8LmrHLDQudMMqgyKylzs4m0TCz_wIvO7oQ7wFqqdjaOntDXlEhXjI73b1yM9I3d6CWnhhuP0QhQ2FPVBXnYx


`,
      },
      params: {
        limit: '5',
        categories,
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
  }
};

const fetchSpot = async (apiId) => {
  try {
    const options = {
      method: 'get',
      url: `https://api.yelp.com/v3/businesses/${apiId}`,
      headers: {
        'Authorization': `Bearer NvKYKbQMrWoA-t6GjdvKF5BCVYnSYfkAjVcfujslxF2o8LmrHLDQudMMqgyKylzs4m0TCz_wIvO7oQ7wFqqdjaOntDXlEhXjI73b1yM9I3d6CWnhhuP0QhQ2FPVBXnYx


`,
      },
    };
    const response = await axios(options);
    const { business } = response.data;
    return business;
  } catch (err) {
    console.error(`Failed to fetch spot: ${err}`);
    return err;
  }
};

const selectMatch = (matches) => {
  const orderedMatches = Object.keys(matches).sort((a, b) => {
    return matches[b].length - matches[a].length;
  });
  return orderedMatches[0];
};

const sanitizeUser = (user) => {
  const {
    username, name, pic, age, gender, preference, bio, latitude, longitude, id, int1, int2, int3,
  } = user;
  const sanitizedUser = {
    username, name, pic, age, gender, preference, bio, latitude, longitude, id, int1, int2, int3,
  };
  return sanitizedUser;
};

const getPic = async (pic) => {
  try {
    const options = {
      method: 'get',
      url: `https://i.imgur.com/${pic}.jpg`,
    };
    const response = await axios(options);
    const { picture } = response.data;
    return picture;
  } catch (err) {
    console.log(err);
    return err;
  }
};
function paramSplitter(endPoint) {
  const result = endPoint.split('=');
  return result;
}


module.exports = {
  fetchRestaurants,
  fetchSpot,
  selectMatch,
  sanitizeUser,
  getPic,
  paramSplitter,
};
