import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
export declare class AuthGuard implements CanActivate {
    private config;
    private jwt;
    constructor(config: ConfigService, jwt: JwtService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
