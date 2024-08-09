/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { Block } from '../block/block.entity';
import { JwtGlobalModule } from '../jwt-global.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Block]),
    CacheModule.register(),
    JwtGlobalModule
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}