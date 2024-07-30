'use client'

import { createContext, useContext } from 'react'
import { initialState } from './reducer'
import { AppContextObject } from './types'

const AppContext = createContext<AppContextObject>({
  state: initialState,
  dispatch: () => {},
})

const useAppContext = () => {
  return useContext(AppContext)
}

export { AppContext, useAppContext }
