'use client'

import { useAppContext } from '@/app/batch-deposit/context'
import Image from 'next/image'
import { ChangeEvent, useState } from 'react'
import { Button } from './Button'
import { ModalWindow } from './ModalWindow'

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
      type: 'setState',
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
          <Image
            alt="Logo"
            className="logo img-center w-16"
            src="/batch-deposit/images/logo.png"
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
          Your use of the service and deposit(s) anticipated [by this agreement]
          will require that you scrupulously follow certain instructions (the
          "instructions"). By accessing this website or using the service you
          agree that at all times you will follow the instructions in full, to
          the letter and without deviation of any sort. You acknowledge and
          agree that any deviation of any sort by you from the instructions or
          failure to scrupulously follow all instructions may result in
          significant negative consequences, including but not limited to loss
          of assets. Informal Systems/Cephalopod Equipment takes no
          responsibility whatsoever for any loss, damage, impact, impairment or
          other result of your failure of any kind to follow the instructions.
          Any such failure or resulting loss is entirely your responsibility.
          Further, your use of the site and the service and [in carrying out
          this contract] will require that you access and utilize a user
          interface provided by Informal Systems/Cephalopod Equipment (the
          "UI"). You agree and warrant that you will not in any way modify,
          change, reverse engineer, decompile, disassemble, copy, monitor or
          otherwise attempt to discern the source code or any other aspect of
          the UI or the Service; (ix) modify, adapt, or create (or attempt to
          create) derivative works from the UI or Services; (x) make any copies
          of the UI or Services (or any portion thereof); (xi) attempt resell,
          distribute, or sublicense the UI or the Services; (xii) remove or
          modify any proprietary marking or restrictive legends placed on the UI
          or the Services; or (xiv) introduce, post, upload, transmit, or
          otherwise make available to or from the UI or the Services any
          Prohibited Content.
          <br></br>THIS AGREEMENT, THE UI AND THE SERVICE IS PROVIDED "AS IS"
          AND “AS AVAILABLE” ONLY WITHOUT ANY CONDITION OR WARRANTY WHATSOEVER.
          YOUR ENTERING THIS CONTRACT, USE OF THE UI AND THE SERVICE IS ENTIRELY
          AT YOUR OWN RISK. ACCORDINGLY, IT IS IMPORTANT THAT YOU READ THESE
          TERMS AND THIS ENTIRE AGREEMENT CAREFULLY TO ENSURE THAT YOU FULLY
          UNDERSTAND YOUR RIGHTS AND OBLIGATIONS, AND THE POTENTIAL
          REPERCUSSIONS AND LIABILITY FOR YOU SHOULD YOU FAIL TO ADHERE TO YOUR
          OBLIGATIONS OR IN ANY OTHER WAY BE IN BREACH OF THESE TERMS OR THIS
          AGREEMENT.
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
            />{' '}
            I agree to the terms and conditions
          </label>
        </div>

        <div>
          <Button
            disabled={!isChecked}
            onClick={handleSubmit}
          >
            {isChecked ? 'Continue' : 'Agree to Continue'}
          </Button>
        </div>
      </div>
    </ModalWindow>
  )
}
