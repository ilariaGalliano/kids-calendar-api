import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private config: ConfigService,
    private jwt: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Bypass token check if using mock DB
    if (this.config.get('USE_MOCK') === '1') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Token mancante');

    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = await this.jwt.verifyAsync(token);
      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token non valido');
    }
  }
}