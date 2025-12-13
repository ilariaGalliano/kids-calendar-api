import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly svc;
    constructor(svc: AuthService);
    register(dto: any): Promise<{
        accessToken: string;
        householdId: string;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
    }>;
}
