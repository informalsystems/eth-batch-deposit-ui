// src/components/TermsAndConditions.js
import React, { useState } from "react";
import Logo from "../assets/images/Informal_Mark.png";

const TermsAndConditions = ({ onAgree }) => {
  const [isChecked, setChecked] = useState(false);

  const handleCheckboxChange = () => {
    setChecked(!isChecked);
  };

  const handleAgreeClick = () => {
    if (isChecked) {
      onAgree();
    } else {
      alert("Please agree to the terms and conditions.");
    }
  };

  return (
    <div className="terms">
      <div>
        <a target="_blank" rel="noreferrer" href="https://informal.systems">
          <img src={Logo} alt="Logo" className="logo w-16 img-center" />
        </a>
        <h2>Terms and Conditions</h2>
        <p>
          This is for authorized testing purposes only, do not use this website!
          <br></br>
          <br></br>
          Your use of the services and deposit(s) anticipated by this agreement
          will require that you scrupulously follow certain instructions (the
          “instructions”). You agree that at all times you will follow the
          instructions in full, to the letter and without deviation of any sort.
          You acknowledge and agree that any deviation of any sort by you from
          the instructions can result in significant negative consequences,
          including but not limited to loss of assets. Informal
          Systems/Cephalopod Equipment takes no responsibility whatsoever for
          any loss, damage, impact, impairment or other result of your failure
          of any kind to follow the instructions. Any such failure or resulting
          loss is entirely your responsibility. Further, your use of the site
          and the services and in carrying out this contract will require that
          you access and utilize a user interface provided by Informal
          Systems/Cephalopod Equipment (the “UI”). You agree and warrant that
          you will not in any way modify, change, reverse engineer, decompile,
          disassemble, or otherwise attempt to discern the source code or any
          other aspect of the UI or the Services; (ix) modify, adapt, or create
          (or attempt to create) derivative works from the UI or Services; (x)
          make any copies of the UI or Services (or any portion thereof); (xi)
          attempt resell, distribute, or sublicense the UI or the Services;
          (xii) remove or modify any proprietary marking or restrictive legends
          placed on the UI or the Services; or (xiv) introduce, post, upload,
          transmit, or otherwise make available to or from the UI or the
          Services any Prohibited Content. <br></br>THIS AGREEMENT, THE UI AND
          THE SERVICE IS PROVIDED “AS IS” WITHOUT ANY CONDITION OR WARRANTY
          WHATSOEVER. YOUR ENTERING THIS CONTRACT, USE OF THE UI AND THE SERVICE
          IS ENTIRELY AT YOUR OWN RISK. ACCORDINGLY, IT IS IMPORTANT THAT YOU
          READ THIS ENTIRE AGREEMENT CAREFULLY TO ENSURE THAT YOU FULLY
          UNDERSTAND YOUR RIGHTS AND OBLIGATIONS, AND THE POTENTIAL
          REPERCUSSIONS AND LIABILITY FOR YOU SHOULD YOU FAIL TO ADHERE TO YOUR
          OBLIGATIONS OR IN ANY OTHER WAY BE IN BREACH OF THIS AGREEMENT.
        </p>
        <label>
          <input
            type="checkbox"
            id="termsandconditions"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          I agree to the terms and conditions
        </label>
        <br></br>
        {isChecked ? (
          <button
            className="terms-button radius mt-4"
            onClick={handleAgreeClick}
          >
            Continue
          </button>
        ) : (
          <button className="terms-button radius mt-4">Continue</button>
        )}
      </div>
    </div>
  );
};

export default TermsAndConditions;
