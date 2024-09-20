export const formatObject = (object, objectKeys) => {
  let data = {};

  objectKeys.forEach((key) => {
    if (key in object) {
      data[key] = object[key];
    } else if (key === "id") {
      data[key] = object["_id"];
    }
  });

  return data;
};

export const formatArrayOfObjects = (array, objectKeys) => {
  let data = {};
  return array.map((item) => {

    objectKeys.forEach((key) => {
      if (key in item) {
        data[key] = item[key];
      } else if (key === "id") {
        data[key] = item["_id"];
      }
    });

    return data;
  });
};
