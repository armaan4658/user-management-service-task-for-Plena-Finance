/* eslint-disable prettier/prettier */
import { Controller, Post, Delete, Param, UsePipes, ValidationPipe, ParseIntPipe, Req } from '@nestjs/common';
import { BlockService } from './block.service';
import { Request } from 'express';
import { buildResponse } from '../utils/common'

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post(':blockedId')
  async blockUser(
    @Param('blockedId', ParseIntPipe) blockedId: number,
    @Req() req: Request,
  ): Promise<object> {
    const { subject } = req['user'];
    const blocked =  await this.blockService.blockUser(subject, blockedId);

    return buildResponse(200, 'User blocked successfully', blocked);
  }

  @Delete(':blockedId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async unblockUser(
    @Param('blockedId', ParseIntPipe) blockedId: number,
    @Req() req: Request,
  ): Promise<object> {
    const { subject } = req['user'];
    const unblocked =  await this.blockService.unblockUser(subject, blockedId);

    return buildResponse(200, 'User unblocked successfully', unblocked);
  }
}