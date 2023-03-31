// createObjectByString
/**
 * @param {string} json
 * @returns {object}
 */

// TODO: Item Object sync with app
// TODO: Item Class
const converObject = (json) => {
  const obj = JSON.parse(json);
  return obj;
};

const createObjectByString = (json) => {
  try {
    return converObject(json);
  } catch (error) {
    return {};
  }
};

export default createObjectByString;
