import { Controller, Post, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      fullName: string;
      companyName: string;
    },
  ) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Get('me')
  async me(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }
}
