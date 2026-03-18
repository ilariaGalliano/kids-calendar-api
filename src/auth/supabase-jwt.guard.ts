import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  private supabaseClient: SupabaseClient | null = null;

  // 🔥 Lazy initialization - crea il client solo quando serve
  private getSupabaseClient(): SupabaseClient {
    if (!this.supabaseClient) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_ANON_KEY;

      if (!url || !key) {
        console.error('❌ Missing Supabase env vars:', { 
          SUPABASE_URL: !!url, 
          SUPABASE_ANON_KEY: !!key 
        });
        throw new UnauthorizedException('Server configuration error');
      }

      this.supabaseClient = createClient(url, key);
    }
    return this.supabaseClient;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    // ✅ Permetti OPTIONS senza autenticazione
    if (req.method === 'OPTIONS') {
      return true;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        console.error('❌ SUPABASE AUTH ERROR:', error?.message || 'No user data');
        throw new UnauthorizedException('Invalid Supabase token');
      }

      req.user = {
        sub: data.user.id,
        email: data.user.email,
      };

      return true;
    } catch (error) {
      console.error('❌ Guard error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}