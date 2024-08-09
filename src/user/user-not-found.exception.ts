/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(userId: number) {
    super(`User with ID ${userId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InternalServerErrorException extends HttpException{
  constructor(msg: string) {
    super(`${msg}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}