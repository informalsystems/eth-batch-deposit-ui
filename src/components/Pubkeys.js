// src/components/Pubkeys.js
import React from "react";

const Pubkeys = (props) => {
  return (
    <div className="pubkeys">
      <div className="keys">
        <div className="font-lg text-white font-bold text-upper p-2 ">
          Validator Pubkeys
        </div>
        {props.pubkeys.map((pubkey, index) => (
          <div className="p-2 pl-6 text-white" key={index}>
            {pubkey}
          </div>
        ))}
        {props.excluded ? (
          props.excluded.map((pubkey, index) => (
            <div className="p-2 pl-6 excludedPubkeys" key={index}>
              {pubkey}
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Pubkeys;
