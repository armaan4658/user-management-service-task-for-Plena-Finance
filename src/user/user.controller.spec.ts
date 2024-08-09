/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './user.dto';
import { User } from './user.entity';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InternalServerErrorException } from './user-not-found.exception';
import { Request } from 'express';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            findByUsername: jest.fn(),
            verifyPassword: jest.fn(),
            generateToken: jest.fn(),
            getBlockedUsers: jest.fn(),
            searchUsers: jest.fn(),
            getUserById: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test',
        pwd: 'test',
        name: 'John',
        surname: 'Doe',
        birthdate: new Date('2000-01-01'),
      };
      
      const user: User = {
        id: 1,
        username: 'test',
        pwd: 'hashed_pwd',
        name: 'John',
        surname: 'Doe',
        birthdate: new Date('2000-01-01'),
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(user);

      const result = await userController.createUser(createUserDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'User created successfully',
        data: user,
        timestamp: expect.any(String),
      });
    });

    it('should throw InternalServerErrorException on error', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test',
        pwd: 'test',
        name: 'John',
        surname: 'Doe',
        birthdate: new Date('2000-01-01'),
      };

      jest.spyOn(userService, 'createUser').mockRejectedValue(new Error());

      await expect(userController.createUser(createUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('validateUser', () => {
    it('should validate user and return token', async () => {
      const loginUserDto:LoginUserDto = { username: 'test', pwd: 'test' };
      const user: User = {
        id: 1,
        username: 'test',
        pwd: 'hashed_pwd',
        name: 'John',
        surname: 'Doe',
        birthdate: new Date('2000-01-01'),
      };
      const accessToken = 'token';
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(user);
      jest.spyOn(userService, 'verifyPassword').mockResolvedValue(true);
      jest.spyOn(userService, 'generateToken').mockResolvedValue(accessToken);

      const result = await userController.validateUser(loginUserDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'User fetched successfully',
        data: { ...user, access_token: accessToken },
        timestamp: expect.any(String),
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginUserDto = { username: 'test', pwd: 'wrong_pwd' };
      const user: User = {
        id: 1,
        username: 'test',
        pwd: 'hashed_pwd',
        name: 'John',
        surname: 'Doe',
        birthdate: new Date('2000-01-01'),
      };
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(user);
      jest.spyOn(userService, 'verifyPassword').mockResolvedValue(false);

      await expect(userController.validateUser(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getBlockedUsers', () => {
    it('should return blocked users', async () => {
      const req = { user: { subject: 1 } } as unknown as Request;
      const blockedUsers = [{ id: 2, username: 'blockedUser' }] as User[];
      jest.spyOn(userService, 'getBlockedUsers').mockResolvedValue(blockedUsers);

      const result = await userController.getBlockedUsers(req);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Blocked users fetched successfully',
        data: blockedUsers,
        timestamp: expect.any(String),
      });
    });
  });

  describe('searchUsers', () => {
    it('should return users based on search criteria', async () => {
      const req = { user: { subject: 1 } } as unknown as Request;
      const username = 'test';
      const minAge = '20';
      const maxAge = '30';
      const users = [{ id: 1, username: 'testUser' }] as User[];
      jest.spyOn(userService, 'searchUsers').mockResolvedValue(users);

      const result = await userController.searchUsers(req, username, minAge, maxAge);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Users fetched successfully',
        data: users,
        timestamp: expect.any(String),
      });
    });

    it('should throw BadRequestException for invalid minAge or maxAge', async () => {
      const req = { user: { subject: 1 } } as unknown as Request;
      const minAge = 'invalid';
      const maxAge = '30';

      await expect(userController.searchUsers(req, undefined, minAge, maxAge)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const id = 1;
      const user = { id: 1, username: 'testUser' } as User;
      jest.spyOn(userService, 'getUserById').mockResolvedValue(user);

      const result = await userController.getUserById(id);

      expect(result).toEqual({
        statusCode: 200,
        message: 'User fetched successfully',
        data: user,
        timestamp: expect.any(String),
      });
    });
  });

  describe('updateUser', () => {
    it('should update user and return the updated user', async () => {
      const updateUserDto = { username: 'updatedUser' } as UpdateUserDto;
      const req = { user: { subject: 1 } } as unknown as Request;
      const updatedUser = { id: 1, username: 'updatedUser' } as User;
      jest.spyOn(userService, 'updateUser').mockResolvedValue(updatedUser);

      const result = await userController.updateUser(updateUserDto, req);

      expect(result).toEqual({
        statusCode: 200,
        message: 'User updated successfully',
        data: updatedUser,
        timestamp: expect.any(String),
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return confirmation', async () => {
      const req = { user: { subject: 1 } } as unknown as Request;
      const userDeleted = { id: 1, username: 'deletedUser' } as User;
      jest.spyOn(userService, 'deleteUser').mockResolvedValue(userDeleted);

      const result = await userController.deleteUser(req);

      expect(result).toEqual({
        statusCode: 200,
        message: 'User deleted successfully',
        data: userDeleted,
        timestamp: expect.any(String),
      });
    });
  });
});
