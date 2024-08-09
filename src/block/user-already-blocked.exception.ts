/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyBlockedException extends HttpException {
  constructor(blockerId: number, blockedId: number) {
    super(`User with ID ${blockedId} is already blocked by user with ID ${blockerId}`, HttpStatus.BAD_REQUEST);
  }
}