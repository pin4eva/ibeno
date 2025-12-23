import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { EmailService } from '../../email/email.service';
import {
  DepartmentEnum,
  InvitationStatusEnum,
  User,
  UserRoleEnum,
  UserStatusEnum,
} from '../../generated/client';
import { PrismaService } from '../../prisma.service';
import { environments } from '../../utils/environments';
import {
  ChangePasswordDTO,
  InviteUserDTO,
  LoginDTO,
  SessionInfo,
  SignupDTO,
} from '../dto/auth.dto';

const tokenOptions: jwt.SignOptions = {
  expiresIn: environments.ACCESS_TOKEN_EXPIRY,
  issuer: 'helar.law',
  algorithm: 'HS256',
  audience: 'helar-clients',
};

type JwtPayload = jwt.JwtPayload & {
  tokenType?: string;
  id: number;
  sessionId: string;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // login
  async login(input: LoginDTO, origin: string) {
    const email = input.email.toLowerCase().trim();
    const password = input.password?.trim();
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('User record not found');
    }

    const authRecord = await this.prisma.auth.findUnique({
      where: { userId: user.id },
    });
    if (!authRecord) {
      const href = origin + '/reset-password?email=' + encodeURIComponent(email);
      const otp = this.generateOTP();
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          otp,
        },
      });

      await this.emailService.sendPasswordUpdateRequiredEmail(email, user.firstName, href);
      return {
        otp,
        message: 'Password update required',
        success: false,
        passwordUpdateRequired: true,
      };
    }

    this.comparePassword(password, authRecord.password);

    const tokens = await this.generateJWTToken(authRecord.userId);
    await this.prisma.auth.update({
      where: { id: authRecord.id },
      data: { lastLogin: new Date() },
    });
    return {
      message: 'Login successful',
      success: true,
      passwordUpdateRequired: false,
      ...tokens,
      user: {
        id: user.id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  // signup
  async signup(input: SignupDTO) {
    const { token } = input;
    // update invitation status if token provided
    const invitation = await this.prisma.invitation.findFirst({
      where: { token },
    });
    if (!invitation) {
      throw new UnauthorizedException('Invalid invitation token');
    }

    // check if user already exists
    const email = invitation.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    // create user
    const newUser = await this.prisma.user.create({
      data: {
        email,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        status: UserStatusEnum.Active,
        role: invitation?.role || UserRoleEnum.User,
        department: invitation?.department || DepartmentEnum.None,
      },
    });

    // create auth record
    const hashedPassword = this.hashPassword(input.password.trim());
    await this.prisma.auth.create({
      data: {
        userId: newUser.id,
        password: hashedPassword,
      },
    });

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatusEnum.Accepted },
    });

    const tokens = await this.generateJWTToken(newUser.id);
    return { message: 'Signup successful', success: true, ...tokens };
  }

  // invite to portal
  async inviteUser(input: InviteUserDTO) {
    const email = input.email.toLowerCase().trim();
    const { role, department } = input;
    try {
      const existingInvitation = await this.prisma.invitation.findFirst({
        where: { email },
      });
      if (existingInvitation) {
        throw new BadRequestException('Invitation already sent to this email');
      }
      const token = randomBytes(16).toString('hex');
      const invitation = await this.prisma.invitation.create({
        data: {
          email,
          token,
          role,
          department,
        },
        omit: { token: true },
      });
      return { message: 'Invitation sent successfully', success: true, invitation };
    } catch (error) {
      throw error;
    }
  }

  // send invitation email
  async sendInvitationEmail(email: string, origin: string) {
    try {
      const invitation = await this.prisma.invitation.findFirst({
        where: { email },
      });
      if (!invitation) {
        throw new BadRequestException('No invitation found for this email');
      }
      const token = invitation.token;
      const href = origin + '/auth/signup?token=' + token;

      // Send email logic here
      await this.emailService.sendInvitationEmail(email, href);
      return { message: 'Invitation email sent successfully', success: true };
    } catch (error) {
      throw error;
    }
  }

  //send reset password email
  async sendResetPasswordEmail(email: string, origin: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email: email.toLowerCase().trim() },
      });
      if (!user) {
        throw new BadRequestException('No user found with this email');
      }
      const auth = await this.prisma.auth.findFirst({
        where: { userId: user.id },
      });
      if (!auth) {
        throw new BadRequestException('No user found with this email');
      }
      const otp = this.generateOTP();
      await this.prisma.auth.update({
        where: { id: auth.id },
        data: { otp },
      });
      const href = origin + '/reset-password?email=' + encodeURIComponent(email);

      // Send email logic here
      await this.emailService.sendResetPasswordEmail(email, user.firstName, href);
      return { message: 'Reset password email sent successfully', success: true };
    } catch (error) {
      throw error;
    }
  }

  // change password
  async changePassword({ otp, password }: ChangePasswordDTO) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ otp }, { auth: { otp } }],
        },
        include: { auth: true },
      });
      if (!user) {
        throw new BadRequestException('Invalid OTP');
      }
      const newPassword = this.hashPassword(password);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          otp: null,
          auth: {
            upsert: {
              create: { password: newPassword },
              update: { password: newPassword, otp: null },
            },
          },
        },
      });
      return { message: 'Password changed successfully', success: true };
    } catch (error) {
      throw error;
    }
  }

  // refresh access token
  async refreshAccessToken(refreshToken: string) {
    // const refreshTokenTrimmed = refreshToken.trim();
    try {
      const decoded = jwt.verify(refreshToken, environments.JWT_SECRET) as {
        id: number;
        tokenType: string;
      };

      if (decoded.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { accessToken } = await this.generateJWTToken(user.id);
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  // private hashPassword
  private hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return `${salt}-${hashedPassword}`;
  }

  private comparePassword(plainPassword: string, hashedPassword: string) {
    const storedPassword = hashedPassword?.split('-')?.[1];
    const isMatch = bcrypt.compareSync(plainPassword, storedPassword);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect Email or password');
    }
    return isMatch;
  }

  private generateOTP(): number {
    return Math.floor(10000 + Math.random() * 90000);
  }

  private async generateJWTToken(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const sessionId = randomBytes(16).toString('hex');
    const payload: JwtPayload = {
      id: userId,
      sessionId,
      tokenType: 'access',
    };
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const accessToken = jwt.sign(payload, environments.JWT_SECRET, tokenOptions);
    const refreshToken = jwt.sign({ ...payload, tokenType: 'refresh' }, environments.JWT_SECRET, {
      ...tokenOptions,
      expiresIn: environments.REFRESH_TOKEN_EXPIRY,
    });

    const sessionInfo: SessionInfo = {
      sessionId,
      userId: user.id,
      createdAt: new Date(),
      user,
    };

    // Store session in cache
    await this.cacheManager.set<SessionInfo>(
      sessionId,
      sessionInfo,
      7 * 24 * 60 * 60, // 7 days
    );

    return { accessToken, refreshToken };
  }

  async decodeJWTToken(token: string): Promise<User | null> {
    if (!token) {
      return null;
    }
    let jwtToken = token;
    if (token.startsWith('Bearer ')) {
      jwtToken = token.slice(7, token.length).trim();
    }
    try {
      const decoded = jwt.verify(jwtToken, environments.JWT_SECRET) as JwtPayload;
      if (decoded?.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      const session = await this.cacheManager.get<SessionInfo>(decoded.sessionId);
      if (!session || session.userId !== decoded.id || !session.user) {
        throw new UnauthorizedException('Invalid session');
      }
      return session.user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // get all invitations
  async getInvitations() {
    return this.prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // delete invitation
  async deleteInvitation(id: number) {
    return this.prisma.invitation.delete({
      where: { id },
    });
  }
}
