import React, { useCallback, useEffect, useRef, useState } from "react";
import Web3 from "web3";
/* import "./styles/styles.css"; */
import "./styles/base.css";
import axios from "axios";
import TermsAndConditions from "./components/Terms";
import Pubkeys from "./components/Pubkeys";
import abi from "./assets/abi.json";
import Logo from "./assets/Informal_Mark.png";
import Upload from "./assets/icons/Upload.png";
import Sign from "./assets/icons/Sign.png";
import Connection_navy from "./assets/icons/Connection_navy.png";
import Wallet_navy from "./assets/icons/Wallet_navy.png";
import Contract_navy from "./assets/icons/Contract_navy.png";
import Maximum_navy from "./assets/icons/Maximum_navy.png";
import Alert from "./assets/icons/Alert.png";

console.clear();

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("");
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [transactionResponse, setTransactionResponse] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [sendContractData, setSendContractData] = useState();
  const [excludeArray, setExludeArray] = useState();
  const [includeArray, setIncludeArray] = useState();
  const [processing, setProcessing] = useState("");
  const [contractAddressInput, setContractAddress] = useState("");
  const [contractAddressURL, setContractAddressURL] = useState("");
  const [err, setErr] = useState("");
  const [isTermsAgreed, setTermsAgreed] = useState(false);
  const network = useState(null);
  const fileInputRef = useRef();
  const maxVal = 50;

  // Helper functions //
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

  const keyToHex = (value) => {
    if (value.slice(0, 2) === "0x") {
      return value;
    }
    return "0x" + value;
  };

  const handleAgree = () => {
    setTermsAgreed(true);
  };
  ////////////////////////////////////////////////////

  // Load metamask and retreive current account
  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const accounts = await window.web3.eth.getAccounts();
      setAccount(accounts[0]);
      window.ethereum.on("accountsChanged", (newAccounts) => {
        setAccount(newAccounts[0]);
      });
      setWeb3(window.web3);
    } else {
      setErr("MetaMask not detected!");
    }
  };

  useEffect(() => {
    loadWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get balance of current account
  useEffect(() => {
    const getBalance = async () => {
      if (web3 && account) {
        const balanceInWei = await web3.eth.getBalance(account);
        const balanceInEther = web3.utils.fromWei(balanceInWei, "ether");
        const roundedBalance = parseFloat(balanceInEther).toFixed(2);
        setBalance(roundedBalance);
      }
    };
    getBalance();
  }, [web3, account, network]);

  // Handle file upload of deposit_data.json
  const handleFileUpload = useCallback((event) => {
    if (
      event &&
      event.target &&
      event.target.files &&
      event.target.files.length > 0
    ) {
      const file = event.target.files[0];

      if (!file) {
        return;
      }
      if (file && file.size < 1024 * 1024 && file.type === "application/json") {
        setProcessing("Parsing validator pubkeys...");
        const reader = new FileReader();

        reader.onload = (e) => {
          const a = e.target.result;
          const jsonCheck = isValidJSON(a);

          // if json is valid and format includes pubkey, network_name, signatures etc...
          if (jsonCheck) {
            setFileContent(a);
          } else {
            setIncludeArray(null);
            setSendContractData(null);
            setErr("Invalid file uploaded...");
            setProcessing(null);
            setFileContent(null);
          }
        };

        reader.readAsText(file);
      } else {
        setErr("File size exceeds 1MB limit or file isn't proper JSON format");
      }
    }
  }, []);

  // setNetwork function for html menu buttons
  const setNetwork = async (networkIdNum) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${networkIdNum.toString(16)}` }],
      });
      setProcessing(null);
      setErr(null);
    } catch (error) {
      console.error("Error switching network:", error);
    }
  };

  // Check network connected
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        if (window.ethereum) {
          await window.ethereum.request({
            method: "eth_requestAccounts",
          });

          const networkId = await window.ethereum.request({
            method: "net_version",
          });

          const getNetwork = (net) => {
            switch (net) {
              case "0x1":
              case "1":
                setCurrentNetwork("mainnet");
                setCurrency("ETH");
                setContractAddress(
                  "0x39DC6a99209B5e6B81dC8540C86Ff10981ebDA29"
                );
                setContractAddressURL(
                  "https://etherscan.io/address/" + contractAddressInput
                );
                break;
              case "0x5":
              case "5":
                setCurrentNetwork("goerli");
                setCurrency("goerliETH");
                setContractAddress(
                  "0x8e22f3F44A6b4E1DFFe22587A06E22283E7AbFB1"
                );
                setContractAddressURL(
                  "https://goerli.etherscan.io/address/" + contractAddressInput
                );
                break;
              case "0x4268":
              case "17000":
                setCurrentNetwork("holesky");
                setCurrency("holeskyETH");
                setContractAddress(
                  "0xF78a36B46Ef0e40dc98780cEE56B1D295F68B0eF"
                );
                setContractAddressURL(
                  "https://holesky.etherscan.io/address/" + contractAddressInput
                );
                break;
              case "59144":
                setCurrentNetwork("Linea Mainnet");
                break;
              case "11155111":
                setCurrentNetwork("Sepolia");
                break;
              case "59140":
                setCurrentNetwork("Linea Goerli");
                break;
              default:
                setCurrentNetwork("Unknown Network");
            }
          };
          getNetwork(networkId);

          window.ethereum.on("chainChanged", (chainId) => {
            getNetwork(chainId);
          });
        } else {
          setCurrentNetwork("MetaMask not installed");
        }
      } catch (error) {
        console.error("Error checking network:", error);
        setCurrentNetwork("Error checking network");
        setErr(error);
      }
    };

    if (account) {
      checkNetwork();
    }
  }, [account, currentNetwork, contractAddressInput]);

  // if currentNetwork changes, trigger handleFileUpload processing that has already been uploaded
  useEffect(() => {
    setSendContractData(null);
    handleFileUpload({ target: fileInputRef.current });
  }, [currentNetwork, handleFileUpload]);

  // Parse ETH smart contract ABI
  useEffect(() => {
    if (web3 && contractAddressInput) {
      try {
        const contractInstance = new web3.eth.Contract(
          abi,
          contractAddressInput
        );
        setContract(contractInstance);
      } catch (error) {
        console.error("Error initializing contract instance:", error);
      }
    }
  }, [web3, contractAddressInput, currentNetwork]);

  // Send and sign transaction in metamask
  const handleSendTransaction = async () => {
    if (web3 && contract) {
      let transactionParameters = {};
      try {
        isValidJSON(sendContractData);

        const contractData = JSON.parse(sendContractData);

        let pubkeys = [];
        let withdrawals = [];
        let signatures = [];
        let deposit_data_roots = [];

        for (let i in contractData) {
          pubkeys.push(keyToHex(contractData[i]["pubkey"]));
          withdrawals.push(keyToHex(contractData[i]["withdrawal_credentials"]));
          signatures.push(keyToHex(contractData[i]["signature"]));
          deposit_data_roots.push(
            keyToHex(contractData[i]["deposit_data_root"])
          );
        }

        let amount = web3.utils.toWei(
          (pubkeys.length * 32).toString(),
          "ether"
        );

        transactionParameters = {
          from: account,
          to: contractAddressInput,
          value: amount,
          data: contract.methods
            .batchDeposit(pubkeys, withdrawals, signatures, deposit_data_roots)
            .encodeABI(),
        };
      } catch (error) {
        console.error("Preparation Error:", error.message);
      }

      try {
        console.log(includeArray);
        await web3.eth
          .sendTransaction(transactionParameters)
          .on("transactionHash", (transactionHash) =>
            setTransactionResponse(transactionHash)
          );
      } catch (error) {
        setSendContractData(null);
        if (error.data.message) {
          console.error("Transaction error:", error.data.message);
          setTransactionResponse("Transaction error:" + error.data.message);
        } else {
          console.error("Transaction error:", error);
          setTransactionResponse("Transaction error:" + error);
        }
      }
    }
  };

  // Check if pubkeys have been used and put in arrays for batch deposit
  useEffect(() => {
    const fetchData = async () => {
      if (!fileContent || !account) {
        return;
      }

      const data = JSON.parse(fileContent);

      const includeIndex = [];
      const excludeIndex = [];

      const accountSubstr = account.slice(-40).toUpperCase();
      for (let j in data) {
        const withdrawalSubstr = data[j].withdrawal_credentials
          .slice(-40)
          .toUpperCase();
        if (data[j].network_name !== currentNetwork) {
          setErr(
            "Current network " +
              currentNetwork +
              " does not match deposit_data intended network " +
              data[j].network_name
          );
          return;
        } else if (withdrawalSubstr !== accountSubstr) {
          setErr(
            "withdrawal_credentials in deposit data does not match current metamask account"
          );
          return;
        }
      }

      if (data && data.length < maxVal) {
        var l = data.length;
        for (let j in data) {
          setErr(null);
          try {
            setProcessing("Parsing validator pubkeys... " + j + "/" + l);
            var pubkey = data[j].pubkey;
            var base_url = "";
            if (currentNetwork === "mainnet") {
              base_url = "https://beaconcha.in/api/v1/validator/";
            } else if (currentNetwork === "goerli") {
              base_url = "https://goerli.beaconcha.in/api/v1/validator/";
            } else if (currentNetwork === "holesky") {
              base_url = "https://holesky.beaconcha.in/api/v1/validator/";
            }
            const response = await axios.get(base_url + pubkey + "/deposits");
            if (response.data.data[0]) {
              excludeIndex.push(parseInt(j));
            } else {
              includeIndex.push(parseInt(j));
            }
          } catch (error) {
            setErr(error);
          }
        }
      } else {
        setErr(
          "No data or trying to max number of validators (max: " + maxVal + ")"
        );
      }

      const excludeArray = [];
      for (let j in excludeIndex) {
        const index = excludeIndex[j];
        excludeArray.push(data[index].pubkey);
      }
      setExludeArray(excludeArray);
      if (excludeArray.length === 0) {
        setExludeArray(null);
      }

      const includeArray = [];
      const arr = [];

      for (let j in includeIndex) {
        const index = includeIndex[j];
        includeArray.push(data[index].pubkey);
        if (data[index].network_name === currentNetwork) {
          arr.push(data[index]);
        }
      }
      setIncludeArray(includeArray);

      if (arr.length === 0 && excludeArray !== 0) {
        setProcessing("No pubkeys included...");
        setErr(null);
        return;
      }

      if (includeArray.length === 0) {
        setIncludeArray(null);
      }

      setSendContractData(JSON.stringify(arr));
      setProcessing(null);
    };

    fetchData();
  }, [fileContent, currentNetwork, account]);

  // App UI
  return (
    <div className="page">
      {!isTermsAgreed ? (
        <TermsAndConditions onAgree={handleAgree} />
      ) : (
        <div>
          <div className="header p-6">
            <div className="flex justify-center">
              <div className="menu-bar grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://informal.systems"
                  >
                    <img src={Logo} alt="Logo" className="logo w-16" />
                  </a>
                </div>
                <div className="col-span-7">
                  <div className="menu-links text-sm tracking-wider">
                    <a href="https://informal.systems">informal systems</a>
                    <a href="https://informal.systems">rewards dashboard</a>
                    <a href="https://informal.systems">stake with us</a>
                    <a href="https://informal.systems">batch deposit</a>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  {account ? (
                    <>
                      <h3 className="font-bold text-sm">WELCOME</h3>
                      <p className="text-sm">
                        {account.slice(0, 6)}...{account.slice(-6)}
                      </p>
                    </>
                  ) : (
                    <button
                      className="text-right border radius border-white text-sm p-2"
                      onClick={loadWeb3}
                    >
                      Connect Metamask
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-center p-6">
              <div className="title-bar grid grid-cols-12 gap-4 align-bottom">
                <div className="col-span-8">
                  <h1 className="text-6xl title-font">
                    Batch Deposit<br></br>Ethereum Validators
                  </h1>
                  <i className="text-sm">...Powered by Informal Systems</i>
                </div>
                <div className="col-span-4 border radius p-4">
                  <div className="flex items-center p-4 text-xs">
                    <div>
                      <p className="text-2xl font-bold pb-4 title-font">
                        Welcome!
                      </p>
                      <div>
                        <div className="grid grid-cols-12 mb-3 items-center">
                          <div className="col-span-1">
                            <i className="border circle mr-3 fas fa-1 fa-2xs"></i>
                          </div>
                          <div className="col-span-11 ml-2">
                            <p>
                              Connect to Metamask and switch to desired network.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="grid grid-cols-12 mb-3 items-center">
                          <div className="col-span-1">
                            <i className="border circle mr-3 fas fa-2 fa-2xs"></i>
                          </div>
                          <div className="col-span-11 ml-2">
                            <p>
                              Upload your <b>deposit_data.json</b>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-12 mb-3 items-center">
                        <div className="col-span-1">
                          <i className="border circle mr-3 fas fa-3 fa-2xs"></i>
                        </div>
                        <div className="col-span-11 ml-2">
                          <p>Confirm and sign transaction on Metamask.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="main mt-6">
              <div className="grid grid-cols-12 gap-5">
                {/*  NETWORK DETAILS  */}
                <div className="col-span-6 bg-white radius">
                  <div className="card-header bg text-white radius-top">
                    <p className="p-4 title-font text-lg">Network Details</p>
                  </div>
                  <div className="p-4 flex justify-center">
                    <div className="grid grid-cols-3 gap-4 bt wd100 text-center">
                      <div className="col-span-1 ml-4">
                        <p className="text-xs pt-1">Select network:</p>
                      </div>
                      <div className="col-span-1 text-sm">
                        <button
                          className={
                            currentNetwork === "mainnet"
                              ? "border br-color-blue radius bg text-white network-button"
                              : "border br-color-blue radius network-button"
                          }
                          onClick={() => setNetwork("1")}
                        >
                          Mainnet
                        </button>
                      </div>
                      <div className="col-span-1  text-sm">
                        <button
                          className={
                            currentNetwork === "holesky"
                              ? "border br-color-blue radius bg text-white network-button"
                              : "border br-color-blue radius network-button"
                          }
                          onClick={() => setNetwork("4268")}
                        >
                          Holesky
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="hr ml-4 mr-4"></div>
                  <div className="p-4 bt">
                    <div className="p-2">
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-1">
                          <img
                            alt=""
                            src={Connection_navy}
                            className="network-ico"
                          ></img>
                        </div>
                        <div className="col-span-11">
                          <p className="text-lg">
                            {account ? account : "...please connect Metamask"}
                          </p>
                        </div>
                        <div className="col-span-1"></div>
                        <div className="col-span-11 text-gray text-xs mt-1">
                          <p>connected account</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hr ml-4 mr-4"></div>
                  <div className="p-4 bt">
                    <div className="p-2">
                      <div className="grid grid-cols-12">
                        <div className="col-span-1">
                          <img
                            alt=""
                            src={Wallet_navy}
                            className="network-ico"
                          ></img>
                        </div>
                        <div className="col-span-11">
                          <p className="text-lg">
                            {account ? (
                              <>
                                {balance} {currency}
                              </>
                            ) : (
                              "..."
                            )}
                          </p>
                        </div>
                        <div className="col-span-1"></div>
                        <div className="col-span-11 text-gray text-xs mt-1">
                          <p>wallet balance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hr ml-4 mr-4"></div>
                  <div className="p-4 bt">
                    <div className="p-2">
                      <div className="grid grid-cols-12">
                        <div className="col-span-1">
                          <img
                            alt=""
                            src={Contract_navy}
                            className="network-ico"
                          ></img>
                        </div>
                        <div className="col-span-11">
                          <a href={contractAddressURL} target="blank">
                            <p className="text-lg">
                              {account ? <>{contractAddressInput}</> : "..."}
                            </p>
                          </a>
                        </div>
                        <div className="col-span-1"></div>
                        <div className="col-span-11 text-gray text-xs mt-1">
                          <p>deposit contract</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hr ml-4 mr-4"></div>
                  <div className="p-4 bt">
                    <div className="p-2">
                      <div className="grid grid-cols-12">
                        <div className="col-span-1">
                          <img
                            alt=""
                            src={Maximum_navy}
                            className="network-ico"
                          ></img>
                        </div>
                        <div className="col-span-11">
                          <p className="text-lg">
                            {account ? (
                              <>
                                {maxVal * 32} {currency}
                              </>
                            ) : (
                              "..."
                            )}
                          </p>
                        </div>
                        <div className="col-span-1"></div>
                        <div className="col-span-11 text-gray text-xs mt-1">
                          <p>max amount per tx</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FILE UPLOAD */}
                <div className="col-span-3 bg-white radius">
                  <div className="">
                    <div className="grid grid-cols-1">
                      <div className="col-span-1">
                        <div className="card-header highlight text-white radius-top">
                          <p className="p-4 title-font text-lg">
                            Upload Your File
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <div className="grid grid-cols-1 p-6">
                        <div className="col-span-1 pt-20">
                          <div className="bt text-center">
                            <img
                              src={Upload}
                              alt=""
                              className="upload-ico img-center"
                            ></img>
                            <p className="pt-6 text-lg">
                              Upload your deposit_data.json file to proceed
                            </p>
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleFileUpload}
                              ref={fileInputRef}
                              id="file"
                              className="file-upload text-center pt-6"
                            />
                            <p>{processing}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TRANSACTION */}
                <div className="col-span-3 bg-faded radius">
                  <div className="card-header bg text-white radius-top">
                    <p className="p-4 title-font text-lg">Transaction</p>
                  </div>
                  <div className="grid grid-cols-1 bt pt-6">
                    <div className="col-span-1 mt-28">
                      <div className="text-center">
                        <img
                          alt=""
                          src={Sign}
                          className="img-center sign-ico"
                        ></img>
                        {sendContractData && account ? (
                          <div>
                            <button
                              onClick={handleSendTransaction}
                              className="text-white radius bg text-upper text-sm m-6 pt-2 pb-2 pl-6 pr-6"
                            >
                              Sign Transaction
                            </button>

                            <div>
                              <div></div>
                              {transactionResponse ? (
                                <div>
                                  <p>TX Response:</p>
                                  <p>{transactionResponse}</p>
                                </div>
                              ) : (
                                <div></div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <button className="text-white radius bg text-upper text-sm m-6 pt-2 pb-2 pl-6 pr-6">
                              Sign Transaction
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1">
                      {err ? (
                        <div>
                          {err ? (
                            <div className="error error-block">
                              <img
                                alt=""
                                src={Alert}
                                className="alert img-center"
                              ></img>
                              <p className="text-center mt-2">{err}</p>
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*    FULL TRANSACTION DETAILS TABLE    */}
          <div className="flex justify-center pt-5">
            <div className="grid grid-cols-1 pubkeys bg-white">
              <div className="col-span-1">
                <div className="card-header bg text-white radius-top">
                  <div className="grid grid-cols-11 items-center p-2">
                    <div className="col-span-5">
                      <p className="p-4 title-font text-lg ml-4">
                        Transaction Details
                      </p>
                    </div>
                    <div className="col-span-2 br pr-5 mr-5 text-right">
                      <p>
                        {includeArray ? (
                          <p>
                            {includeArray.length * 32} {currency}
                          </p>
                        ) : (
                          <p>0 {currency}</p>
                        )}{" "}
                      </p>
                      <p className="text-gr text-upper text-2xs mt-1">
                        total {currency} to be staked
                      </p>
                    </div>
                    <div className="col-span-2 br pr-5 mr-5 text-right">
                      <p className="text-lg">
                        {includeArray ? <p>{includeArray.length}</p> : 0}
                      </p>
                      <p className="text-gr text-upper text-2xs mt-1">
                        validator count
                      </p>
                    </div>
                    <div className="col-span-2 pr-5 text-right">
                      <p className="text-lg">
                        {excludeArray ? <p>{excludeArray.length}</p> : 0}
                      </p>
                      <p className="text-gr text-upper text-2xs mt-1">
                        excluded pubkey count
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-1 bg-faded">
                {includeArray && !err && !processing ? (
                  <div>
                    <div className="grid grid-cols-1 p-4">
                      <Pubkeys pubkeys={includeArray} exlcuded={excludeArray} />
                    </div>
                  </div>
                ) : (
                  <div>
                    {processing ? (
                      <p className=" text-white p-6 font-lg">
                        <i>{processing}</i>
                      </p>
                    ) : (
                      <></>
                    )}
                    {err ? (
                      <div>
                        {err ? <h2 className="error">Error: {err}</h2> : <></>}
                      </div>
                    ) : (
                      <></>
                    )}
                    {!processing && !err ? (
                      <p className="text-white text-upper p-6 ">
                        <i>...waiting for file upload</i>
                      </p>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 disclaimer pt-6 pb-6 pl-10 pr-10 text-center text-xs">
              <div>
                <p>
                  <i>
                    If any have any problems, please reach out to
                    validator@informal.systems
                  </i>
                </p>
                <p>Do not use this tool, it is still in testing.</p>
                <p>
                  If ledger is making you verify many fields, turn off `Debug
                  data` in Ethereum App settings. If transaction fails do not
                  try again.
                </p>
                <p>
                  exluded pubkeys are validator signing keys that have already
                  been used and cant be used again.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
