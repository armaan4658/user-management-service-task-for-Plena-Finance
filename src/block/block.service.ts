/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './block.entity';
import { UserAlreadyBlockedException } from './user-already-blocked.exception';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async blockUser(blockerId: number, blockedId: number): Promise<void> {
    const existingBlock = await this.blockRepository.findOneBy({ blockerId, blockedId });
    if (existingBlock) {
      throw new UserAlreadyBlockedException(blockerId, blockedId);
    }
    
    const block = this.blockRepository.create({ blockerId, blockedId });
    await this.blockRepository.save(block);

    // Invalidate cache entries related to the user
    const keys = await this.cacheManager.store.keys(`search_users_*`);
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    const result = await this.blockRepository.delete({ blockerId, blockedId });
    if (result.affected === 0) {
      throw new BadRequestException(`User with ID ${blockedId} is not blocked by user with ID ${blockerId}`);
    }

    // Invalidate cache entries related to the user
    const keys = await this.cacheManager.store.keys(`search_users_*`);
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }
}