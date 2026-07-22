import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
// import { createHash, randomInt } from 'crypto';
import type { Response } from 'express';
import { Role } from '../../generated/prisma/client';
// TODO(email): bật lại cùng AUTH_EMAIL_FLOWS_ENABLED
// import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AUTH_COOKIE_NAMES,
  getAccessTokenCookieOptions,
  getClearAuthCookieOptions,
  getRefreshTokenCookieOptions,
} from './auth-cookie.config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenService } from './token.service';

const BCRYPT_ROUNDS = 12;

/** TODO(email): tắt quên/reset mật khẩu qua mail — bật lại khi SMTP + reset-token ổn. */
const AUTH_EMAIL_FLOWS_ENABLED = false;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    // private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto, res: Response) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim() || null,
        passwordHash,
        role: Role.USER,
      },
      select: this.userSelect,
    });

    this.setAuthCookies(res, user, false);
    return {
      message: 'Đăng ký thành công',
      user,
    };
  }

  async login(dto: LoginDto, res: Response) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    this.setAuthCookies(res, safeUser, Boolean(dto.rememberMe));
    return {
      message: 'Đăng nhập thành công',
      user: safeUser,
    };
  }

  logout(res: Response) {
    res.clearCookie(AUTH_COOKIE_NAMES.accessToken, getClearAuthCookieOptions());
    res.clearCookie(AUTH_COOKIE_NAMES.refreshToken, getClearAuthCookieOptions());
    return { message: 'Đã đăng xuất' };
  }

  async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Thiếu refresh token');
    }

    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: this.userSelect,
    });

    if (!user) {
      this.logout(res);
      throw new UnauthorizedException('Tài khoản không còn tồn tại');
    }

    // Giữ trạng thái ghi nhớ đăng nhập khi rotate cookie
    this.setAuthCookies(res, user, Boolean(payload.remember));
    return {
      message: 'Đã làm mới phiên đăng nhập',
      user,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.userSelect,
    });
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }
    return { user };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    // TODO(email): khi bật lại — KHÔNG đổi password trước khi mail gửi OK;
    // nên dùng PasswordResetToken + link, không gửi plaintext pass tạm.
    void AUTH_EMAIL_FLOWS_ENABLED;
    void dto;
    throw new ServiceUnavailableException(
      'Tính năng quên mật khẩu đang tạm khóa. Vui lòng liên hệ trung tâm qua Zalo để được hỗ trợ.',
    );

    /*
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true },
    });

    if (user) {
      const tempPassword = `dks${randomInt(10000, 100000)}`;
      const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      void this.mailService.sendForgotPasswordHelp(
        user.email,
        user.fullName,
        tempPassword,
      );
    } else {
      void this.mailService.sendForgotPasswordNotFound(email);
    }

    return {
      message:
        'Đã gửi email tới địa chỉ bạn vừa nhập. Vui lòng kiểm tra hộp thư (và mục Spam).',
    };
    */
  }

  async resetPassword(dto: ResetPasswordDto) {
    void AUTH_EMAIL_FLOWS_ENABLED;
    void dto;
    throw new ServiceUnavailableException(
      'Tính năng đặt lại mật khẩu đang tạm khóa. Vui lòng liên hệ trung tâm qua Zalo để được hỗ trợ.',
    );

    /*
    const tokenHash = this.hashToken(dto.token.trim());
    const record = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!record) {
      throw new BadRequestException(
        'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.' };
    */
  }

  private setAuthCookies(
    res: Response,
    user: { id: string; email: string; role: Role },
    rememberMe: boolean,
  ) {
    const accessToken = this.tokenService.signAccessToken(user);
    const refreshToken = this.tokenService.signRefreshToken(user, rememberMe);

    res.cookie(
      AUTH_COOKIE_NAMES.accessToken,
      accessToken,
      getAccessTokenCookieOptions(),
    );
    res.cookie(
      AUTH_COOKIE_NAMES.refreshToken,
      refreshToken,
      getRefreshTokenCookieOptions(rememberMe),
    );
  }

  // private hashToken(token: string) {
  //   return createHash('sha256').update(token).digest('hex');
  // }

  private readonly userSelect = {
    id: true,
    email: true,
    fullName: true,
    phone: true,
    role: true,
    createdAt: true,
  } as const;
}
