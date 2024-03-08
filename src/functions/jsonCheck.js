const isValidJSON = (jsonString) => {
  try {
    const js = JSON.parse(jsonString);
    if (
      js[0].pubkey &&
      js[0].network_name &&
      js[0].withdrawal_credentials &&
      js[0].signature &&
      js[0].deposit_data_root
    ) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("File uploaded is not valid JSON: ", error);
    return false;
  }
};

export default isValidJSON;
