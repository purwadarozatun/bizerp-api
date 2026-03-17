import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@bis/database';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaClient, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
        token: string;
    }>;
    private signToken;
}
//# sourceMappingURL=auth.service.d.ts.map