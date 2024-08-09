/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Put, Delete, Query, Req, UsePipes, ValidationPipe, UnauthorizedException, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './user.dto';
import { InternalServerErrorException } from './user-not-found.exception';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async createUser(@Body() createUserDto: CreateUserDto): Promise<object> {
    try {
      const user: User = await this.userService.createUser(createUserDto);
      return {
        statusCode: 200,
        message: 'User created successfully',
        data: user,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Log the error
      console.error('Error creating user:', error);

      // Throw a specific error message
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Post('login')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async validateUser(@Body() loginUserDto: LoginUserDto): Promise<object> {
    const { username, pwd } = loginUserDto;
    const user = await this.userService.findByUsername(username);

    // Check if user exists and password is correct
    if (user && (await this.userService.verifyPassword(pwd, user.pwd))) {
      const payload = { username: user.username, subject: user.id };
      const access_token = await this.userService.generateToken(payload);
      delete user['pwd'];
      return {
        statusCode: 200,
        message: 'User fetched successfully',
        data: { ...user, access_token },
        timestamp: new Date().toISOString(),
      };
    }

    // If credentials are incorrect, throw an UnauthorizedException
    throw new UnauthorizedException('Invalid credentials');
  }

  @Get('blocked')
  async getBlockedUsers(@Req() req: Request): Promise<object> {
    const { subject } = req['user']; // Extract user details from the request object
    const blockedUsers: User[] = await this.userService.getBlockedUsers(subject);

    return {
      statusCode: 200,
      message: 'Blocked users fetched successfully',
      data: blockedUsers,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('search')
  async searchUsers(
    @Req() req: Request,
    @Query('username') username?: string,
    @Query('minAge') minAge?: string,
    @Query('maxAge') maxAge?: string,
  ): Promise<object> {
    const { subject } = req['user'];

    const parsedMinAge = minAge ? parseInt(minAge, 10) : undefined;
    const parsedMaxAge = maxAge ? parseInt(maxAge, 10) : undefined;

    if (minAge && isNaN(parsedMinAge)) {
      throw new BadRequestException('minAge must be a number');
    }

    if (maxAge && isNaN(parsedMaxAge)) {
      throw new BadRequestException('maxAge must be a number');
    }

    console.log('Parsed Values:', { username, parsedMinAge, parsedMaxAge });

    const users: User[] = await this.userService.searchUsers(
      subject,
      username,
      parsedMinAge,
      parsedMaxAge,
    );

    return {
      statusCode: 200,
      message: 'Users fetched successfully',
      data: users,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<object> {
    const user: User = await this.userService.getUserById(id);
    return {
      statusCode: 200,
      message: 'User fetched successfully',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request, // Access the request object
  ): Promise<object> {
    const user = req['user']; // Access the user details from the token
    const { subject } = user;
    const updateUser = await this.userService.updateUser(
      subject,
      updateUserDto,
    );

    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: updateUser,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete()
  async deleteUser(@Req() req: Request,): Promise<object> {
    const { subject } = req['user'];
    const userDeleted = await this.userService.deleteUser(subject);
    return {
      statusCode: 200,
      message: 'User deleted successfully',
      data: userDeleted,
      timestamp: new Date().toISOString(),
    };
  }
}