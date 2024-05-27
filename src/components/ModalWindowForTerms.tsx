import { ChangeEvent, useState } from "react"
import { useAppContext } from "../context"
import { Button } from "./Button"
import { ModalWindow } from "./ModalWindow"

export const ModalWindowForTerms = () => {
  const [isChecked, setIsChecked] = useState(false)

  const {
    dispatch,
    state: { isTermsAgreed },
  } = useAppContext()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked)
  }

  const handleSubmit = () => {
    if (!isChecked) {
      return
    }

    dispatch({
      type: "setState",
      payload: {
        isTermsAgreed: true,
      },
    })
  }

  return (
    <ModalWindow
      isOpen={!isTermsAgreed}
      onClose={() => {}}
    >
      <div
        className="
          flex
          items-center
          gap-6
          text-2xl
          font-bold
        "
      >
        <a
          target="_blank"
          rel="noreferrer"
          href="https://informal.systems"
        >
          <img
            src="/batch-deposit/images/logo.png"
            alt="Logo"
            className="logo img-center w-16"
          />
        </a>

        <h2>Terms and Conditions</h2>
      </div>

      <div
        className="
          space-y-6
          overflow-auto
          border-b
          pb-6
        "
      >
        <p>
          Your use of the services and deposit(s) anticipated by this agreement
          will require that you scrupulously follow certain instructions (the
          &ldquo;instructions&rdquo;). You agree that at all times you will
          follow the instructions in full, to the letter and without deviation
          of any sort. You acknowledge and agree that any deviation of any sort
          by you from the instructions can result in significant negative
          consequences, including but not limited to loss of assets. Informal
          Systems/Cephalopod Equipment takes no responsibility whatsoever for
          any loss, damage, impact, impairment or other result of your failure
          of any kind to follow the instructions. Any such failure or resulting
          loss is entirely your responsibility. Further, your use of the site
          and the services and in carrying out this contract will require that
          you access and utilize a user interface provided by Informal
          Systems/Cephalopod Equipment (the &ldquo;UI&rdquo;). You agree and
          warrant that you will not in any way modify, change, reverse engineer,
          decompile, disassemble, or otherwise attempt to discern the source
          code or any other aspect of the UI or the Services; (ix) modify,
          adapt, or create (or attempt to create) derivative works from the UI
          or Services; (x) make any copies of the UI or Services (or any portion
          thereof); (xi) attempt resell, distribute, or sublicense the UI or the
          Services; (xii) remove or modify any proprietary marking or
          restrictive legends placed on the UI or the Services; or (xiv)
          introduce, post, upload, transmit, or otherwise make available to or
          from the UI or the Services any Prohibited Content.
        </p>
        <p>
          All users whether provided with explicit instructions or not assumes
          all risks associated with the use of this application. By agreeing to
          these terms and conditions, the user acknowledges that Informal
          Systems/Cephalopod Equipment shall not be held liable for any losses
          or damages incurred.
        </p>
        <p>
          THIS AGREEMENT, THE UI AND THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo;
          WITHOUT ANY CONDITION OR WARRANTY WHATSOEVER. YOUR ENTERING THIS
          CONTRACT, USE OF THE UI AND THE SERVICE IS ENTIRELY AT YOUR OWN RISK.
          ACCORDINGLY, IT IS IMPORTANT THAT YOU READ THIS ENTIRE AGREEMENT
          CAREFULLY TO ENSURE THAT YOU FULLY UNDERSTAND YOUR RIGHTS AND
          OBLIGATIONS, AND THE POTENTIAL REPERCUSSIONS AND LIABILITY FOR YOU
          SHOULD YOU FAIL TO ADHERE TO YOUR OBLIGATIONS OR IN ANY OTHER WAY BE
          IN BREACH OF THIS AGREEMENT.
        </p>
        <p>Formatted for desktop use only&hellip;</p>
      </div>

      <div
        className="
          flex
          items-center
          justify-between
          gap-6
        "
      >
        <div>
          <label
            className="
              flex
              items-center
              gap-2
            "
          >
            <input
              checked={isChecked}
              className="
                size-6
                rounded-md
                border-2
                !border-white
                bg-transparent
                checked:text-brandColor
              "
              id="termsandconditions"
              type="checkbox"
              onChange={handleChange}
            />{" "}
            I agree to the terms and conditions
          </label>
        </div>

        <div>
          <Button
            disabled={!isChecked}
            onClick={handleSubmit}
          >
            {isChecked ? "Continue" : "Agree to Continue"}
          </Button>
        </div>
      </div>
    </ModalWindow>
  )
}
