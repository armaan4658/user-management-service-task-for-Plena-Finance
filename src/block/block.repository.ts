/* eslint-disable prettier/prettier */
import { DataSource } from 'typeorm';
import { Block } from './block.entity';

export const BlockRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Block).extend({
    // Custom methods for BlockRepository can be added here if needed
  });
};