import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import bcrypt from 'bcryptjs';
import { LoginDTO, SessionInfo } from '../dto/auth.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { environments } from 'src/utils/environments';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { User } from '../../generated/client';

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
  ) {}

  // login
  async login(input: LoginDTO) {
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
      throw new UnauthorizedException('Incorrect Email or password');
    }
    this.comparePassword(password, authRecord.password);
    return { message: 'Login successful', userId: authRecord.userId };
  }

  // invite to portal

  //send reset password email

  // change password

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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
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

  private async decodeJWTToken(token: string): Promise<User | null> {
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
}
