import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(email: string, password: string): Promise<{
        accessToken: string;
    }>;
    private sign;
    register(email: string, password: string, householdName: string): Promise<{
        accessToken: string;
        householdId: string;
    }>;
}
