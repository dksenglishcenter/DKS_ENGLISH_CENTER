import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AUTH_COOKIE_NAMES } from '../auth-cookie.config';
import { TokenService } from '../token.service';

export type AuthRequestUser = {
  id: string;
  email: string;
  role: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthRequestUser }>();
    const token = request.cookies?.[AUTH_COOKIE_NAMES.accessToken] as string | undefined;

    if (!token) {
      throw new UnauthorizedException('Bạn chưa đăng nhập');
    }

    const payload = this.tokenService.verifyAccessToken(token);
    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return true;
  }
}
