// src/components/Pubkeys.js
import React from "react";

const Pubkeys = (props) => {
  return (
    <div className="pubkeys">
      {props.txResponse ? (
        <div className="keys">
          <div className="title-font text-xl text-white font-bold text-upper p-2 ">
            Transaction was successful!
          </div>
          <div className="hash p-6">
            <a
              className="text-white text-lg char-wrap"
              target="blank"
              href={props.pubkeyURL + "tx/" + props.txResponse}
            >
              Transaction Hash: <b>{props.txResponse}</b>
              <i className="text-xs"> click hash to view on beaconcha.in</i>
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
          {props.pubkeys.length > 0 ? (
            <div className="font-lg text-white font-bold text-upper p-2 ">
              Validator Pubkeys
            </div>
          ) : (
            <></>
          )}
          {props.pubkeys.length > 0 ? (
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
