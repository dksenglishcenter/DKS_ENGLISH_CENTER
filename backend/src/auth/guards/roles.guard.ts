import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthRequestUser } from './jwt-auth.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthRequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    // Role trong access token có thể cũ sau khi admin thay đổi quyền.
    // Đọc DB để thao tác hạ quyền/xóa tài khoản có hiệu lực ngay.
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (!currentUser || !roles.includes(currentUser.role)) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    user.role = currentUser.role;
    return true;
  }
}
