import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@bis/database';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(prisma: PrismaClient, config: ConfigService);
    validate(payload: JwtPayload): Promise<JwtPayload>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map