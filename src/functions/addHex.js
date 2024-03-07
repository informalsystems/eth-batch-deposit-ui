const addHex = (value) => {
  if (value.slice(0, 2) === "0x") {
    return value;
  }
  return "0x" + value;
};

export default addHex;
