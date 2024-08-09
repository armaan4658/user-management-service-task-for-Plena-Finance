/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Block } from '../block/block.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserNotFoundException } from './user-not-found.exception';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Block) private readonly blockRepository: Repository<Block>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createUserDto.pwd, salt);
  
      const user = this.userRepository.create({
        ...createUserDto,
        pwd: hashedPassword,
      });
  
      return this.userRepository.save(user);

  }

  async getBlockedUsers(subjectId: number): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoin('block', 'block', 'block.blockedId = user.id')
      .where('block.blockerId = :subjectId', { subjectId })
      .select([
        'user.id',
        'user.name',
        'user.surname',
        'user.username',
        'user.birthdate']) // Select only the fields you want
      .getMany();
  }

  async generateToken(payload: object): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }


  async getUserById(id: number): Promise<User> {
    // Generate a unique cache key based on the search criteria
    const cacheKey = `user_${id}`;

    // Check if the result is in the cache
    let user = await this.cacheManager.get<User>(cacheKey);

    if(!user){
      user = await this.userRepository.findOneBy({id});
      if (!user) {
        throw new UserNotFoundException(id);
      }
      delete user['pwd'];
      await this.cacheManager.set(cacheKey, user, 600); // Cache for 10 minutes
    }
    
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<object> {
    const updatedValues: UpdateUserDto = {};

    // Only update values present in the request
    for(const [key,val] of Object.entries(updateUserDto)){
      if(key == 'pwd'){
        const salt = await bcrypt.genSalt();
        updatedValues[key] = await bcrypt.hash(val, salt);
        continue;
      }
      if(val) updatedValues[key] = val
    }

    const result = await this.userRepository.update(id, updatedValues);
    if (result.affected === 0) {
      throw new UserNotFoundException(id);
    }
    return result;
  }

  async deleteUser(id: number): Promise<object> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new UserNotFoundException(id);
    }
    await this.cacheManager.del(`user_${id}`);
    return result;
  }

  async searchUsers(subjectId: number, username?: string, minAge?: number, maxAge?: number): Promise<User[]> {

    // Generate a unique cache key based on the search criteria
    const cacheKey = `search_users_${subjectId}_${username || ''}_${minAge || ''}_${maxAge || ''}`;

    // Check if the result is in the cache
    let users = await this.cacheManager.get<User[]>(cacheKey);

    if(!users){
      const query = this.userRepository.createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.surname',
        'user.username',
        'user.birthdate'
      ]);
  
      if (username) {
        query.andWhere('user.username LIKE :username', { username: `%${username}%` });
      }
  
      if (minAge !== undefined) {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - minAge);
        query.andWhere('user.birthdate <= :minDate', { minDate: minDate.toISOString() });
      }
  
      if (maxAge !== undefined) {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - maxAge);
        query.andWhere('user.birthdate >= :maxDate', { maxDate: maxDate.toISOString() });
      }
  
      // Exclude blocked users
      query.leftJoin('block', 'block', 'block.blockerId = :subjectId AND block.blockedId = user.id', { subjectId });
      query.andWhere('block.blockedId IS NULL');
  
      users = await query.getMany();
      await this.cacheManager.set(cacheKey, users, 600); // Cache for 10 minutes
    }

    return users
  }
}
