/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Put, Delete, Query, Req, UsePipes, ValidationPipe, UnauthorizedException, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './user.dto';
import { InternalServerErrorException } from './user-not-found.exception';
import { Request } from 'express';
import { buildResponse } from '../utils/common'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async createUser(@Body() createUserDto: CreateUserDto): Promise<object> {
    try {
      const user: User = await this.userService.createUser(createUserDto);
      return buildResponse(200, 'User created successfully', user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async validateUser(@Body() loginUserDto: LoginUserDto): Promise<object> {
    const { username, pwd } = loginUserDto;
    const user = await this.userService.findByUsername(username);

    if (user && await this.userService.verifyPassword(pwd, user.pwd)) {
      const payload = { username: user.username, subject: user.id };
      const accessToken = await this.userService.generateToken(payload);
      delete user.pwd;
      return buildResponse(200, 'User fetched successfully', { ...user, access_token: accessToken });
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  @Get('blocked')
  async getBlockedUsers(@Req() req: Request): Promise<object> {
    const { subject } = req['user'];
    const blockedUsers = await this.userService.getBlockedUsers(subject);
    return buildResponse(200, 'Blocked users fetched successfully', blockedUsers);
  }

  @Get('search')
  async searchUsers(
    @Req() req: Request,
    @Query('username') username?: string,
    @Query('minAge') minAge?: string,
    @Query('maxAge') maxAge?: string,
  ): Promise<object> {
    const { subject } = req['user'];

    const parsedMinAge = this.parseAge(minAge, 'minAge');
    const parsedMaxAge = this.parseAge(maxAge, 'maxAge');

    console.log('Parsed Values:', { username, parsedMinAge, parsedMaxAge });

    const users = await this.userService.searchUsers(subject, username, parsedMinAge, parsedMaxAge);
    return buildResponse(200, 'Users fetched successfully', users);
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<object> {
    const user = await this.userService.getUserById(id);
    return buildResponse(200, 'User fetched successfully', user);
  }

  @Put('')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: Request): Promise<object> {
    const { subject } = req['user'];
    const updatedUser = await this.userService.updateUser(subject, updateUserDto);
    return buildResponse(200, 'User updated successfully', updatedUser);
  }

  @Delete()
  async deleteUser(@Req() req: Request): Promise<object> {
    const { subject } = req['user'];
    const userDeleted = await this.userService.deleteUser(subject);
    return buildResponse(200, 'User deleted successfully', userDeleted);
  }

 

  // Utility function to parse and validate age query parameters
  private parseAge(age: string | undefined, fieldName: string): number | undefined {
    if (age === undefined) return undefined;
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge)) {
      throw new BadRequestException(`${fieldName} must be a number`);
    }
    return parsedAge;
  }
}