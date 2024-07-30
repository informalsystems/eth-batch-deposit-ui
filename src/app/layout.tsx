import { AppContextProvider } from "@/components"
import type { Viewport } from "next"
import { Glegoo, Inter } from "next/font/google"
import Script from "next/script"
import { twJoin } from "tailwind-merge"
import "./global.css"

export async function generateMetadata() {
  return {
    title: "Informal Staking | ETH",
    description: "Site description",
    keywords: ["site", "keywords"],
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

const bodyFont = Inter({ subsets: ["latin"], variable: "--font-inter" })

const displayFont = Glegoo({
  subsets: ["latin"],
  variable: "--font-glegoo",
  weight: ["400", "700"],
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AppContextProvider>
      <html
        className="
          [font-size:16px]
          md:[font-size:20px]
          2xl:[font-size:24px]
        "
        lang="en"
      >
        <head>
          <Script
            crossOrigin="anonymous"
            src="https://kit.fontawesome.com/401fb1e734.js"
          />
        </head>

        <body
          className={twJoin(
            bodyFont.className,
            bodyFont.variable,
            displayFont.variable,
            `
              overflow-x-hidden
              font-light
            `,
          )}
        >
          {children}
        </body>
      </html>
    </AppContextProvider>
  )
}
