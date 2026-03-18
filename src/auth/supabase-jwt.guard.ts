import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    console.log('🔐 JWT Guard - checking auth');
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ No Authorization header');
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('❌ No token in header');
      throw new UnauthorizedException('Missing token');
    }

    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
      console.log('❌ CRITICAL: SUPABASE_JWT_SECRET not found in env!');
      throw new UnauthorizedException('Server configuration error');
    }

    console.log('✅ Secret present, verifying token...');

    try {
      const payload = jwt.verify(token, secret) as any;

      console.log('✅ Token verified, user:', payload.sub);

      // 🔥 FONDAMENTALE
      req.user = {
        sub: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid Supabase JWT');
    }
  }
}
