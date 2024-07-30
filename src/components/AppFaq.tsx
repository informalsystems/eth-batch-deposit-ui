'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'Where do I get the deposit_data.json file?',
    answer:
      "If you would like to stake with Informal Systems please reach out to validator@informal.systems, \
	  we will provide you with this file when your validator is ready and help you with onboarding steps (minimum 32 ETH required), \
	  otherwise you can generate your own with this tool: https://github.com/ethereum/staking-deposit-cli \
	  if you'd like to run your own validator (proceed with caution)",
  },
  {
    question: 'How do I stake with this UI?',
    answer:
      'Simply upload the deposit_data.json file and click sign transaction. This UI checks if the withdrawal credentials \
	  for your validator rewards/staked ETH match the wallet your are depositing your ETH with to ensure you have control \
	  of the withdrawal credentials so no tokens/rewards get lost. In the future this UI will only warn about withdrawal credentials \
	  not matching your current wallet address to allow for other restaking applications to be used (as they require different withdrawal credentials).',
  },
  {
    question: 'How long will it take for my validator to become active?',
    answer:
      'Depending on the validator queue it can take 1-7+ days but most occur in 24 hours. \
	  More information about the deposit process can be found here: https://kb.beaconcha.in/ethereum-staking/deposit-process.',
  },
  {
    question:
      "I am getting an error that says withdrawal credentials don't match my connected account, what is this?",
    answer:
      'This means that the validators you are depositing your ETH to are only able to to be controlled by the withdrawal credentials \
      and to make sure you have control over this address. The withdrawal credentials are the wallet that will receive all ETH staking rewards \
      and when the validator is unbonded, the 32 ETH deposited will be returned to the withdrawal credentials.',
  },
]

export const AppFaq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="">
      <h2 className="mb-4 font-display text-2xl font-bold text-brandColor">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4 pl-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="faq-item"
          >
            <button
              className="w-full rounded-md bg-brandColor/5 px-4 py-2 text-left"
              onClick={() => toggleFaq(index)}
            >
              <span>{faq.question}</span>
            </button>
            <div
              className={`faq-content mt-2 rounded-md bg-brandColor/5 p-4 pl-8 text-brandColor ${
                openIndex === index ? '' : 'hidden'
              }`}
            >
              <p className="font-code text-sm font-bold">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
