import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { SessionAuthService } from './session-auth/session-auth.service';
import { User } from '../user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { ResEx } from 'src/swaggers/response-examples';

@ApiTags('Xác thực (Auth)')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly sessionAuth: SessionAuthService,
  ) {}

  private mapUserResponse(user: User) {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  private async sessionFromRequest(req: { headers: any }) {
    const ctx = await this.sessionAuth.resolveSessionContext(req.headers);
    if (!ctx) return null;

    return {
      user: this.mapUserResponse(ctx.user),
      session: {
        token: ctx.session.token,
        expiresAt: ctx.session.expiresAt,
      },
    };
  }

  // Lấy user hiện tại
  @Get('me')
  @ApiOperation({
    summary: 'Lấy thông tin user hiện tại (bearer hoặc cookie session)',
    operationId: 'auth_get_me',
  })
  @ApiOkResponse({
    description:
      'Ví dụ khi đã đăng nhập; khi không có session trả authenticated: false',
    schema: { example: ResEx.auth.me },
  })
  @ApiBearerAuth()
  @ApiBadRequestResponse({
    description: 'Token không hợp lệ hoặc đã hết hạn',
    schema: { example: ResEx.auth.verifyEmailBadRequest },
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy người dùng',
    schema: { example: ResEx.auth.verifyEmailNotFound },
  })
  async getCurrentUser(@Req() req: any) {
    const session = await this.sessionFromRequest(req);

    if (!session?.user) {
      return {
        success: false,
        authenticated: false,
        message: 'Not authenticated',
        user: null,
      };
    }

    const fullUser = await this.userService.getUser(session.user.id);
    return {
      success: true,
      authenticated: true,
      user: fullUser ? this.mapUserResponse(fullUser) : session.user,
    };
  }

  // Lấy session hiện tại
  @Get('session')
  @ApiOperation({
    summary: 'Lấy session (token, hết hạn, user)',
    operationId: 'auth_get_session',
  })
  @ApiOkResponse({
    description: 'Ví dụ khi có session',
    schema: { example: ResEx.auth.session },
  })
  @ApiBearerAuth()
  async getSession(@Req() req: any) {
    const session = await this.sessionFromRequest(req);

    if (!session?.session) {
      return {
        success: false,
        authenticated: false,
      };
    }

    return {
      success: true,
      authenticated: true,
      session: {
        token: session.session.token,
        expiresAt: session.session.expiresAt,
      },
      user: session.user,
    };
  }

  // Kiểm tra user có đang đăng nhập không?
  @Get('check')
  @ApiOperation({
    summary: 'Kiểm tra đã đăng nhập chưa',
    operationId: 'auth_check',
  })
  @ApiOkResponse({
    description: 'Ví dụ phản hồi',
    schema: { example: ResEx.auth.check },
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async checkAuth(@Req() req: any) {
    const session = await this.sessionFromRequest(req);

    if (!session?.user) {
      return {
        authenticated: false,
        user: null,
      };
    }
    return {
      authenticated: true,
      user: session.user,
    };
  }
}
