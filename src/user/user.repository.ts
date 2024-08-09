/* eslint-disable prettier/prettier */
import {  DataSource } from 'typeorm';
import { User } from './user.entity';

export const UserRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(User).extend({
    // Custom methods for UserRepository can be added here if needed
  });
};