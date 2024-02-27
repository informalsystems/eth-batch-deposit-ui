import React, { useCallback, useEffect, useRef, useState } from "react";
import Web3 from "web3";
/* import "./styles/styles.css"; */
import "./styles/base.css";
import axios from "axios";
import TermsAndConditions from "./components/Terms";
import abi from "./assets/abi.json";
import Logo from "./assets/is.png";

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
  const [browser, setBrowser] = useState(null);
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

  useEffect(() => {
    const isNotFirefox = !/Firefox/.test(navigator.userAgent);

    if (isNotFirefox) {
      setProcessing(null);
    } else {
      setBrowser("firefox");
      setErr(
        "Please dont use Firefox, this browser has become temporarily unsupported for importing ledger devices into metamask..."
      );
    }
  }, []);

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
                    <img
                      src={Logo}
                      alt="Logo"
                      className="logo w-16 grayscale-image"
                    />
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
                  <div class="flex items-center p-4 text-xs">
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
                        <p className="text-2xs pt-1">Select network:</p>
                      </div>
                      <div className="col-span-1">
                        <button
                          className={
                            currentNetwork === "mainnet"
                              ? "border radius bg text-white"
                              : "border radius"
                          }
                          onClick={() => setNetwork("1")}
                        >
                          Mainnet
                        </button>
                      </div>
                      <div className="col-span-1">
                        <button
                          className={
                            currentNetwork === "holesky"
                              ? "border radius bg text-white"
                              : "border radius"
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
                          <i className="fa fa-balance-scale network-ico"></i>
                        </div>
                        <div className="col-span-11">
                          <p className="text-lg">{account}</p>
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
                          <i className="fa fa-wallet network-ico"></i>
                        </div>
                        <div className="col-span-11">
                          <p className="text-lg">
                            {balance} {currency}
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
                          <i className="fa fa-file network-ico"></i>
                        </div>
                        <div className="col-span-11">
                          <a href={contractAddressURL} target="blank">
                            <p className="text-lg">{contractAddressInput}</p>
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
                          <i className="fa fa-copy network-ico"></i>
                        </div>
                        <div className="col-span-11">
                          <p className="text-lg">
                            {maxVal * 32} {currency}
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
                <div className="col-span-3 bg-faded radius">
                  <div className="">
                    <div className="grid grid-cols-1">
                      <div className="col-span-1">
                        <div className="card-header bg text-white radius-top">
                          <p className="p-4 title-font text-lg">
                            Upload Your File
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 p-6">
                      <div className="col-span-1 pt-20">
                        <div className="text-white text-center">
                          <i className="fa fa-file-code mt-2 upload-ico"></i>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TRANSACTION DETAILS */}
                <div className="col-span-3 bg-white radius">
                  <div className="card-header highlight text-white radius-top">
                    <p className="p-4 title-font text-lg">
                      Transaction Details
                    </p>
                  </div>
                  <div className="grid grid-cols-1 bt pt-6">
                    <div className="col-span-1 pt-20">
                      <div className="text-center">
                        <i className="fa fa-file mt-2 sign-ico"></i>
                        <br></br>
                        <button
                          onClick={handleSendTransaction}
                          className="text-white radius highlight pt-2 pb-2 pl-6 pr-6 m-6"
                        >
                          Sign Transaction
                        </button>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <p className="text-center">
                        {err ? (
                          <div>
                            {err ? (
                              <p className="error">Error: {err}</p>
                            ) : (
                              <></>
                            )}
                          </div>
                        ) : (
                          <></>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <hr></hr>

          {/* vvvvvvvvvv OLD VERSION --- TO BE REMOVED AFTER REFACTOR vvvvvvv */}
          <div className="top grid grid-cols-3 gap-4">
            <div className="col-span-1 p-4"></div>
            <div className="align-title col-span-2 p-4">
              <div className="grid grid-cols-3">
                <div className="col-span-3 p-2">
                  <h1 className="title">
                    <b>Batch Deposit Ethereum Validators</b>
                  </h1>
                </div>
                <div className="menuButton col-span-1">
                  <a href="https://informal.systems">informal systems</a>
                </div>
                <div className="menuButton col-span-1">
                  <a href="https://informal.systems">rewards dashboard</a>
                </div>
                <div className="menuButton col-span-1">
                  <a href="https://informal.systems/staking">stake with us</a>
                </div>
              </div>
            </div>
          </div>

          <br></br>
          <div className="grid grid-cols-3 gap-4">
            <div className="align steps col-span-1 grid-bg p-4">
              <p>
                <i>Step 1: </i> Connect metamask and switch to desired network.
              </p>
              <p>
                <i>Step 2: </i> Upload your <i>deposit_data.json</i> below.
              </p>
              <p>
                <i>Step 3: </i> Confirm and sign transaction in metamask.
              </p>
              <a href="https://informal.systems">
                Learn how to stake on more networks with <b>Informal Systems</b>
              </a>
            </div>
            <div className="col-span-2 grid-bg p-4">
              <div className="grid grid-cols-4">
                <div className="align col-span-1">
                  <h2>Select Network: </h2>
                </div>
                <div className="col-span-1 p-1">
                  <button
                    className={`networkButton ${
                      currentNetwork !== "mainnet" ? "disabled" : ""
                    }`}
                    onClick={() => setNetwork("1")}
                  >
                    Mainnet
                  </button>
                </div>
                <div className="col-span-1 p-1">
                  <button
                    className={`networkButton ${
                      currentNetwork !== "holesky" ? "disabled" : ""
                    }`}
                    onClick={() => setNetwork("4268")}
                  >
                    Holesky
                  </button>
                </div>
                <div className="col-span-1 p-1">
                  <button
                    className={`networkButton ${
                      currentNetwork !== "goerli" ? "disabled" : ""
                    }`}
                    onClick={() => setNetwork("5")}
                  >
                    Goerli
                  </button>
                </div>
              </div>
              <div>
                {account ? (
                  <div>
                    <div className="grid grid-cols-3">
                      <div className="tb tb-head tb-tl tb-tr align tb-right1 col-span-3">
                        <p>Network Details</p>
                      </div>
                      <div className="tb align tb-left1 col-span-1 grid-bg">
                        <p className="account-info">Connected Network</p>
                      </div>
                      <div className="tb align tb-right1 col-span-2 grid-bg">
                        <p className="account-info">{currentNetwork}</p>
                      </div>
                      <div className="tb align tb-left2 col-span-1 grid-bg">
                        <p className="account-info">Connected Account</p>
                      </div>
                      <div className="tb align tb-right2 col-span-2 grid-bg">
                        <p className="account-info">{account}</p>
                      </div>
                      <div className="tb align tb-left1 col-span-1 grid-bg">
                        <p className="account-info">Wallet Balance</p>
                      </div>
                      <div className="tb align tb-right1 col-span-2 grid-bg">
                        <p className="account-info">
                          {balance} {currency}
                        </p>
                      </div>
                      <div className="tb align tb-left2 col-span-1 grid-bg">
                        <p className="account-info">Deposit Contract</p>
                      </div>
                      <div className="tb align tb-right2 col-span-2 grid-bg">
                        <p className="account-info">
                          <a
                            rel="noreferrer"
                            target="_blank"
                            href={contractAddressURL}
                            className="contract-info"
                          >
                            {contractAddressInput}
                          </a>
                        </p>
                      </div>
                      <div className="tb align tb-bl tb-left1 col-span-1 grid-bg">
                        <p className="account-info">Max amount per TX</p>
                      </div>
                      <div className="tb align tb-br tb-right1 col-span-2 grid-bg">
                        <p className="account-info">
                          {maxVal * 32} {currency}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button className="button" onClick={loadWeb3}>
                    Connect Metamask Wallet
                  </button>
                )}
              </div>
            </div>

            <div className="align col-span-1 grid-bg p-4">
              <div>
                <div>
                  <p className="p-4">
                    Upload your
                    <b>
                      <i>deposit_data.json </i>
                    </b>
                    file to proceed...
                  </p>
                  {browser !== "firefox" ? (
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      id="file"
                    />
                  ) : (
                    <input
                      type="file"
                      accept=".json"
                      ref={fileInputRef}
                      id="file"
                    />
                  )}

                  <br></br>
                </div>
              </div>
            </div>
            <div className="col-span-2 grid-bg p-4">
              <div className="grid grid-cols-3">
                <div className="tb tb-head tb-tl tb-tr align tb-right1 col-span-3">
                  <p>Transaction Details</p>
                </div>
                {includeArray && !err && !processing ? (
                  <>
                    <div className="tb align tb-left2 col-span-1">
                      <p>amount to stake</p>
                    </div>
                    <div className="tb align tb-right2 col-span-2">
                      {includeArray ? (
                        <p>
                          {includeArray.length * 32} {currency}
                        </p>
                      ) : (
                        <p>0</p>
                      )}
                    </div>
                    <div className="tb align tb-left1 col-span-1 p-4">
                      <p>exluded pubkeys</p>
                    </div>
                    <div className="tb align tb-right1 col-span-2 p-4">
                      {excludeArray ? <p>{excludeArray.length}</p> : <p>0</p>}
                    </div>
                    <div className="tb tb-bl align tb-left2 col-span-1 p-4">
                      <p>Transaction Response</p>
                    </div>
                    <div className="tb tb-br align tb-right2 col-span-2 p-4">
                      {transactionResponse ? (
                        <p>{transactionResponse}</p>
                      ) : (
                        <p>...waiting for signature</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="tb tb-tl tb-tr align tb-right1 col-span-3">
                    {processing ? (
                      <h2>
                        <i>{processing}</i>
                      </h2>
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
                  </div>
                )}
              </div>
              {sendContractData && account && browser !== "firefox" ? (
                <div>
                  <br></br>
                  <button onClick={handleSendTransaction} className="button">
                    Sign Transaction
                  </button>

                  <div>
                    <div></div>
                    {transactionResponse ? (
                      <div>
                        <p>Transaction Response:</p>
                        <p>{transactionResponse}</p>
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <button className="button disabled">Sign Transaction</button>
                </div>
              )}
            </div>
          </div>
          <div className="spacer"></div>
          <p>
            <i>
              If any have any problems, please reach out to
              validator@informal.systems
            </i>
          </p>
          <p className="disclaimer">
            This is for testing purposes only. Please use Chrome browser. Ensure
            pubkeys have not been added to chain already before depositing. If
            ledger is making you verify many fields, turn off `Debug data` in
            Ethereum App settings. If transaction fails do not try again.
          </p>
          <p>
            exluded pubkeys are validator signing keys that have already been
            used and cant be used again.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
