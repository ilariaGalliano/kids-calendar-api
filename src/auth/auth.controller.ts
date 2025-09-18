import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('register')
//   RegisterDto
  register(@Body() dto: any) {
    return this.svc.register(dto.email, dto.password, dto.householdName);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.svc.login(dto.email, dto.password);
  }
}
