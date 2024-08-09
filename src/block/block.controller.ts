/* eslint-disable prettier/prettier */
import { Controller, Post, Delete, Param, UsePipes, ValidationPipe, ParseIntPipe, Req } from '@nestjs/common';
import { BlockService } from './block.service';
import { Request } from 'express';

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

    return {
      statusCode: 200,
      message: 'User blocked successfully',
      data: blocked,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':blockedId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async unblockUser(
    @Param('blockedId', ParseIntPipe) blockedId: number,
    @Req() req: Request,
  ): Promise<object> {
    const { subject } = req['user'];
    const unblocked =  await this.blockService.unblockUser(subject, blockedId);

    return {
      statusCode: 200,
      message: 'User unblocked successfully',
      data: unblocked,
      timestamp: new Date().toISOString(),
    };
  }
}