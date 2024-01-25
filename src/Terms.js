// src/components/TermsAndConditions.js
import React, { useState } from "react";

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
        <h2>Terms and Conditions</h2>
        <p>
          This is for authorized testing purposes only, do not use this website!
          <br></br>
          <br></br>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque in
          facilisis turpis. Integer ut augue vel libero blandit tristique a a
          turpis. Sed commodo, leo et pellentesque varius, justo elit tincidunt
          mauris, sit amet dignissim odio justo ac libero. Fusce nec urna a
          metus tincidunt euismod. Nullam quis tortor in justo commodo
          facilisis. Vivamus sagittis ligula ut risus tincidunt, ut suscipit
          justo tincidunt. Aenean eu nisl nec neque feugiat congue id vel quam.
          Proin auctor nisl ut tortor congue, vel congue elit fringilla. Nullam
          hendrerit, risus nec posuere dapibus, justo elit fermentum velit.
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
          <button className="button" onClick={handleAgreeClick}>
            Continue
          </button>
        ) : (
          <button className="button disabled">Continue</button>
        )}
      </div>
    </div>
  );
};

export default TermsAndConditions;
