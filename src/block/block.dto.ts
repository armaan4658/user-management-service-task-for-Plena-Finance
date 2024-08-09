/* eslint-disable prettier/prettier */
import { IsInt } from 'class-validator';

export class BlockUserDto {
  @IsInt()
  blockerId: number;

  @IsInt()
  blockedId: number;
}