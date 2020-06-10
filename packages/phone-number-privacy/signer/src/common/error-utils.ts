import { Response } from 'express'
import logger from './logger'

export enum ErrorMessages {
  UNKNOWN_ERROR = 'CELO_PNP_ERR_00 Something went wrong',
  DATABASE_UPDATE_FAILURE = 'CELO_PNP_ERR_01 Failed to update database entry',
  DATABASE_INSERT_FAILURE = 'CELO_PNP_ERR_02 Failed to insert database entry',
  DATABASE_GET_FAILURE = 'CELO_PNP_ERR_03 Failed to get database entry',
  INVALID_INPUT = 'CELO_PNP_ERR_04 Invalid input paramaters',
  EXCEEDED_QUOTA = 'CELO_PNP_ERR_05 Requester exceeded salt service query quota',
  SIGNATURE_COMPUTATION_FAILURE = 'CELO_PNP_ERR_06 Failed to compute BLS signature',
  UNAUTHENTICATED_USER = 'CELO_PNP_ERR_10 Missing or invalid authentication header',
}

export function respondWithError(res: Response, statusCode: number, error: ErrorMessages) {
  logger.error('Responding with error', error)
  res.status(statusCode).json({ success: false, error })
}
