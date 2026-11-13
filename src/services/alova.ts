import { axiosRequestAdapter } from '@alova/adapter-axios'
import { createAlova } from 'alova'
import ReactHook from 'alova/react'
import { API_BASE_URL, axiosClient } from './http'

export const alovaClient = createAlova({
  baseURL: API_BASE_URL,
  statesHook: ReactHook,
  requestAdapter: axiosRequestAdapter({ axios: axiosClient }),
  responded: (response) => response.data,
})
