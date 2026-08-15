import { setupWorker } from 'msw/browser'
import { userHandlers } from './userHandlers'

export const worker = setupWorker(...userHandlers)
