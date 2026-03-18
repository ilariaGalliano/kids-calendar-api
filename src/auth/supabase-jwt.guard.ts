import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Request } from 'express';

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    if (req.method === 'OPTIONS') {
      return true;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error('SUPABASE AUTH ERROR:', error);
      throw new UnauthorizedException('Invalid Supabase token');
    }

    req.user = {
      sub: data.user.id,
      email: data.user.email,
    };

    return true;
  }
}