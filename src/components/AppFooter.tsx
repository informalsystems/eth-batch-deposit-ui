import { SectionContainer } from "./SectionContainer"
import GithubLogo from "/images/github-mark.png"

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
      <a
        href="https://github.com/informalsystems/eth-batch-deposit-ui"
        target="_blank"
      >
        <img
          src={GithubLogo}
          className="float-left w-6 opacity-70"
        />
      </a>
      <span className=" ml-2 text-xs leading-8 text-brandColor">
        &copy; {currentYear}
        <a
          href="https://informal.systems"
          target="_blank"
        >
          Informal Systems.
        </a>
        Audited by
        <a
          href="https://spearbit.com"
          target="_blank"
        >
          SpearBit
        </a>
        .
      </span>
    </SectionContainer>
  )
}
