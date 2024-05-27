export const classNamesForAllVariants = ``

export const classNamesByVariant = {
  "accentuated": `
    text-lg
    text-brandColor
    dark:text-white
  `,
  "centered-column": `
    flex
    flex-col
    items-center
    justify-center
  `,
  "centered-row": `
    flex
    flex-col
    items-center
    justify-center
  `,
  "code": `
    font-code
    text-inherit
    dark:text-inherit
  `,
  "heading1": `
    font-display
    text-6xl
    font-bold
    text-inherit
    dark:text-inherit
  `,
  "heading2": `
    font-display
    text-2xl
    font-bold
    text-inherit
    dark:text-inherit
  `,
  "heading3": `
    font-display
    text-lg
    font-bold
    text-inherit
    dark:text-inherit
  `,
  "label": `
    text-sm
    uppercase
    text-fadedTextColor
    dark:text-white/60
  `,
  "link": `
    text-accentColor
    dark:text-white/80
    underline
  `,
  "numbered-list": `
    space-y-3
    text-sm
    pl-8
    [counter-reset:list]
    *:relative
    *:flex
    *:items-center
    *:pl-3
    *:[counter-increment:list]
    *:before:absolute
    *:before:right-full
    *:before:flex
    *:before:size-7
    *:before:items-center
    *:before:justify-center
    *:before:rounded-full
    *:before:border
    *:before:border-white
    *:before:content-[counters(list,'')]
  `,
}
