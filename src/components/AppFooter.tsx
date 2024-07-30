import Image from 'next/image'
import { AppFaq } from './AppFaq'
import { SectionContainer } from './SectionContainer'

export const AppFooter = () => {
  const currentYear = new Date().getFullYear()
  return (
    <SectionContainer
      className="
        space-y-8
        pb-6
        pt-4
      "
    >
      <div className="grid grid-cols-6">
        <div className="col-span-4">
          <AppFaq />
        </div>
        <div className="col-span-2">
          <div className="pl-8 pt-12 text-center">
            <a
              className="
                relative
                rounded-lg
                opacity-100
                transition-opacity
                duration-200
                hover:opacity-80
              "
              href="https://youtu.be/fYPuBfwgy-0?feature=shared"
              target="_blank"
            >
              <Image
                alt="YouTube Tutorial"
                src="/images/Youtube_Thumbnail_EthStakingTutorial_YTLogo.jpg"
                fill={true}
              />
              <i className="text-xs">For more instructions follow this video</i>
            </a>
          </div>
        </div>
        <div className="col-span-4 m-0 p-0"></div>
        <div className="col-span-2">
          <div className="float-right mt-4">
            <a
              href="https://github.com/informalsystems/eth-batch-deposit-ui"
              target="_blank"
            >
              <Image
                alt="Github Logo"
                src="/images/github-mark.png"
                className="float-left w-6 opacity-70"
              />
            </a>
            <span className="text-dimgrey ml-2 text-xs leading-8">
              &copy; {currentYear}
              <a
                href="https://informal.systems"
                target="_blank"
              >
                &nbsp;Informal Systems.
              </a>
              &nbsp;Audited by
              <a
                href="https://spearbit.com"
                target="_blank"
              >
                &nbsp;SpearBit
              </a>
              .
            </span>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
