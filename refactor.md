### refactor notes

- state for currentChainId
- checkNetwork function needs to be simplified...probably part of above task
- setup chainInfoById

  - chain id
  - currency
  - contractAddress
  - contractAdressURL
  - beaconURL

- remove `react-hooks/exhaustive-deps`
- remove axios
- rename include and exlude arrays....make sure to commit just before to revert easy if it breaks
- move functions that dont need to set state into functions folder
- fix loadweb3 function...duplicate calls?? and messy code
- rename contractData state variables and any others that are confusing
- delete any unnecessary files
-

- write nice neat comments for each section of code
