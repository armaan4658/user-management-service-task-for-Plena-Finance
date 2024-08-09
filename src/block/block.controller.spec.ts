/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('BlockController', () => {
  let blockController: BlockController;
  let blockService: BlockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockController],
      providers: [
        {
          provide: BlockService,
          useValue: {
            blockUser: jest.fn(),
            unblockUser: jest.fn(),
          },
        },
      ],
    }).compile();

    blockController = module.get<BlockController>(BlockController);
    blockService = module.get<BlockService>(BlockService);
  });

  describe('blockUser', () => {
    it('should block a user successfully', async () => {
      const blockedId = 2;
      const req = { user: { subject: 1 } } as unknown as Request;
      
      // Mock the blockUser method to return void (undefined)
      jest.spyOn(blockService, 'blockUser').mockResolvedValue(undefined);

      const result = await blockController.blockUser(blockedId, req);

      expect(result).toEqual({
        statusCode: 200,
        message: 'User blocked successfully',
        timestamp: expect.any(String),
      });
    });

    it('should throw an error if blocking fails', async () => {
      const blockedId = 2;
      const req = { user: { subject: 1 } } as unknown as Request;
      
      // Mock the blockUser method to throw an exception
      jest.spyOn(blockService, 'blockUser').mockRejectedValue(new BadRequestException('Unable to block user'));

      await expect(blockController.blockUser(blockedId, req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('unblockUser', () => {
    it('should unblock a user successfully', async () => {
      const blockedId = 2;
      const req = { user: { subject: 1 } } as unknown as Request;
      
      // Mock the unblockUser method to return void (undefined)
      jest.spyOn(blockService, 'unblockUser').mockResolvedValue(undefined);

      const result = await blockController.unblockUser(blockedId, req);

      expect(result).toEqual({
        statusCode: 200,
        message: 'User unblocked successfully',
        timestamp: expect.any(String),
      });
    });

    it('should throw an error if unblocking fails', async () => {
      const blockedId = 2;
      const req = { user: { subject: 1 } } as unknown as Request;
      
      // Mock the unblockUser method to throw an exception
      jest.spyOn(blockService, 'unblockUser').mockRejectedValue(new BadRequestException('Unable to unblock user'));

      await expect(blockController.unblockUser(blockedId, req)).rejects.toThrow(BadRequestException);
    });
  });
});
