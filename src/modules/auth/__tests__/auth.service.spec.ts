import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn(),
}));

// Minimal Prisma mock
function makePrismaMock() {
  return {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
}

// Minimal JWT mock
function makeJwtMock() {
  return {
    sign: vi.fn().mockReturnValue('mock_jwt_token'),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let jwt: ReturnType<typeof makeJwtMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    jwt = makeJwtMock();
    service = new AuthService(prisma as never, jwt as never);
    vi.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      organizationId: 'org-1',
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    };

    it('should successfully register a new user', async () => {
      prisma.user.findFirst.mockResolvedValue(null); // No existing user
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role,
        organizationId: registerDto.organizationId,
      });

      const result = await service.register(registerDto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { organizationId: registerDto.organizationId, email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          organizationId: registerDto.organizationId,
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          passwordHash: 'hashed_password',
          role: registerDto.role,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: registerDto.email,
        organizationId: registerDto.organizationId,
        role: registerDto.role,
      });
      expect(result).toEqual({
        user: {
          id: 'user-1',
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          role: registerDto.role,
          organizationId: registerDto.organizationId,
        },
        token: 'mock_jwt_token',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('Email already registered'),
      );

      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should default to "user" role if not provided', async () => {
      const dtoWithoutRole = { ...registerDto, role: undefined };
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: 'user',
        organizationId: registerDto.organizationId,
      });

      await service.register(dtoWithoutRole as RegisterDto);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'user',
          }),
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: 'user-1',
      email: loginDto.email,
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      organizationId: 'org-1',
      passwordHash: 'hashed_password',
      isActive: true,
      lastLoginAt: null,
    };

    it('should successfully login with valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { lastLoginAt: expect.any(Date) },
      });
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        organizationId: mockUser.organizationId,
        role: mockUser.role,
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
        token: 'mock_jwt_token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if account is disabled', async () => {
      prisma.user.findFirst.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Account is disabled'),
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should update lastLoginAt on successful login', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue(mockUser);

      const beforeLogin = new Date();
      await service.login(loginDto);
      const afterLogin = new Date();

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { lastLoginAt: expect.any(Date) },
      });

      const lastLoginAt = prisma.user.update.mock.calls[0][0].data.lastLoginAt as Date;
      expect(lastLoginAt.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
      expect(lastLoginAt.getTime()).toBeLessThanOrEqual(afterLogin.getTime());
    });
  });
});
