const bcrypt = require('bcrypt');
const {
  User, Date, UserInterest, Couple, Friends, Category, Spot, Op, Messages,
} = require('../sequelize');
const {
  restCategories, fetchRestaurant, haversineDistance, topInterest,
} = require('../helpers/db-helpers.js');
const customers = require('../../test-data/customers');
const messages = require('../../test-data/messages');

//  Use this function to populate the restaurant sub-categories.
//  This only needs to be done on database init
const populateCategories = async () => {
  try {
    const categoryOptions = {
      name: 'Restaurants',
      alias: 'restaurants',
    };
    const options = {
      name: 'movie',
      alias: 'movie',
    };
    const categoryArray = await Category.findOrCreate({ where: categoryOptions });
    const re = await Category.findOrCreate({ where: options });

    const { id: categoryId } = categoryArray[0];
    const interests = await restCategories();
    interests.forEach((interest) => {
      const interestOptions = {
        name: interest.name,
        alias: interest.alias,
        parentId: categoryId,
      };
      Category.findOrCreate({ where: interestOptions });
    });
  } catch (err) {
    console.error(`Populate Categories failed: ${err}`);
  }
};

//  Feel free to comment this call out after the first run
populateCategories();

const populateUsers = () => {
  User.bulkCreate(customers);
};

populateUsers();

const populateMessages = () => {
  Messages.bulkCreate(messages);
};

populateMessages();

User.prototype.validPassword = async (password) => {
  try {

    return bcrypt.compare(password, this.password);
  } catch (err) {
    return console.error(err);
  }
};

User.prototype.findMatches = async (interests, user) => {
  populateMessages();
  try {
    const {
      id: userId, longitude: userLon, latitude: userLat, gender: userGen, preference: userPref,
    } = user;
    // const matchingInterests = await interests.map((categoryId) => {
    //   return UserInterest.findAll({ categoryId });
    // });
    const matchingUsers = await UserInterest.findAll({
      where: {
        categoryId: {
          [Op.or]: interests,
        },
      },
    });
    const matchIds = matchingUsers.map(match => match.id);
    const allMatchData = await User.findAll({
      where: {
        id: {
          [Op.or]: [matchIds],
        },
      },
    });
    const filteredMatches = allMatchData.reduce((matches, match) => {
      const {
        id: matchId, longitude: matchLon, latitude: matchLat, gender: matchGen, preference: matchPref,
      } = match;
      if (matchId === userId
        || haversineDistance([userLon, userLat], [matchLon, matchLat]) > 10
        || userPref !== matchGen
        || matchPref !== userGen) {
        return matches;
      }
      if (matches[matchId] === undefined) {
        matches[matchId] = 0;
      }
      matches[matchId]++;
      return matches;
    }, {});
    return filteredMatches;
  } catch (err) {
    console.error(err);
    return err;
  }
};

Couple.prototype.findSpot = async (couple) => {
  try {
    const { user1Id, user2Id } = couple;
    const interestsRows = await UserInterest.findAll({
      where: {
        userId: {
          [Op.or]: [user1Id, user2Id],
        },
      },
    });
    const matchedInterestId = topInterest(interestsRows);
    const matchedInterest = await Category.findByPk(matchedInterestId);
    const { longitude, latitude } = await User.findByPk(user1Id);
    const newSpot = fetchRestaurant(matchedInterest, longitude, latitude);
    return newSpot;
  } catch (err) {
    console.error(`Failed to find new match: ${err}`);
    return err;
  }
};

module.exports = {
  User,
  Date,
  UserInterest,
  Couple,
  Friends,
  Category,
  Spot,
  Op,
  Messages,
};
