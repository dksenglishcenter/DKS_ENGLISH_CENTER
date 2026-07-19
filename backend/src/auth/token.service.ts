import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type { Role } from '../../generated/prisma/client';

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
  type: 'access' | 'refresh';
  /** Chỉ có trên refresh token khi user chọn ghi nhớ đăng nhập. */
  remember?: boolean;
};

@Injectable()
export class TokenService {
  private get secret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Thiếu JWT_SECRET trong biến môi trường');
    }
    return secret;
  }

  signAccessToken(user: { id: string; email: string; role: Role }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };
    return jwt.sign(payload, this.secret, { expiresIn: '15m' });
  }

  signRefreshToken(
    user: { id: string; email: string; role: Role },
    rememberMe = false,
  ) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
      ...(rememberMe ? { remember: true } : {}),
    };
    return jwt.sign(payload, this.secret, {
      expiresIn: rememberMe ? '30d' : '1d',
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, this.secret) as JwtPayload;
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Token không hợp lệ');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập hết hạn hoặc không hợp lệ');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, this.secret) as JwtPayload;
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập hết hạn hoặc không hợp lệ');
    }
  }
}
