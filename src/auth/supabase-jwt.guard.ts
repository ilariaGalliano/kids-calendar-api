import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  private client = jwksClient({
    jwksUri: `https://pntcmsezdbpulkdbujkz.supabase.co/auth/v1/keys`,
  });

   canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(
        token,
        process.env.SUPABASE_JWT_SECRET!,
        { algorithms: ['HS256'] }
      );

      req.AppUser = decoded;
      return true;
    } catch (err) {
      console.error('JWT ERROR:', err.message);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.getKey.bind(this),
        {
          audience: 'authenticated',
          issuer: `https://pntcmsezdbpulkdbujkz.supabase.co/auth/v1`,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        },
      );
    });
  }

  private getKey(header, callback) {
    this.client.getSigningKey(header.kid, (err, key) => {
      if (err || !key) {
        callback(err || new Error('Signing key not found'), null);
        return;
      }
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    });
  }
}
