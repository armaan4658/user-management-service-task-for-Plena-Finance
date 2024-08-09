/* eslint-disable prettier/prettier */
export function buildResponse(statusCode: number, message: string, data: any): object {
    return {
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }