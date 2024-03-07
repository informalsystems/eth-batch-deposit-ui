// src/components/Pubkeys.js
import React from "react";

const Pubkeys = (props) => {
  return (
    <div className="pubkeys">
      {props.txResponse ? (
        <div className="keys">
          <div className="font-lg text-white font-bold text-upper p-2 ">
            Transaction was successful!{" "}
            <i>
              ...view your validator deposits below or visit our rewards
              dashboard
            </i>
          </div>
          <div className="hash">
            <a target="blank" href={props.pubkeyURL + "tx/" + props.txResponse}>
              Transaction Hash: <b>{props.txResponse}</b>
            </a>
          </div>
          {props.pubkeys.map((pubkey, index) => (
            <div className="p-2 pl-6 text-white" key={index}>
              <a
                target="blank"
                alt=""
                href={props.pubkeyURL + "validator/" + pubkey}
              >
                {pubkey.slice(0, 64)}.....
              </a>
              <p className="float-right font-bold">SUCCESS</p>
            </div>
          ))}
          {props.excluded ? (
            props.excluded.map((xpubkey, xindex) => (
              <div className="p-2 pl-6 excludedPubkeys" key={xindex}>
                <a
                  target="blank"
                  alt=""
                  href={props.pubkeyURL + "validator/" + xpubkey}
                >
                  {xpubkey.slice(0, 64)}.....
                </a>
                <p className="float-right font-bold">ALREADY DEPOSITED</p>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
      ) : (
        <div className="keys">
          {props.pubkeys ? (
            <div className="font-lg text-white font-bold text-upper p-2 ">
              Validator Pubkeys
            </div>
          ) : (
            <></>
          )}
          {props.pubkeys ? (
            props.pubkeys.map((pubkey, index) => (
              <div className="p-2 pl-6 text-white" key={index}>
                {pubkey}
              </div>
            ))
          ) : (
            <></>
          )}
          {props.excluded.length > 0 ? (
            props.excluded.map((xpubkey, xindex) => (
              <div className="p-2 pl-6 excludedPubkeys" key={xindex}>
                <a
                  target="blank"
                  alt={xpubkey}
                  href={props.pubkeyURL + "validator/" + xpubkey}
                >
                  {xpubkey.slice(0, 64)}.....
                </a>
                <p className="float-right font-bold">...ALREADY DEPOSITED</p>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
};

export default Pubkeys;
