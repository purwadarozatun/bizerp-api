"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@bis/database");
let ContactsService = class ContactsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, search, page = 1, pageSize = 25) {
        const where = {
            organizationId,
            ...(search ? { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }, { company: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {}),
        };
        const p = Number.isFinite(+page) && +page > 0 ? +page : 1;
        const ps = Number.isFinite(+pageSize) && +pageSize > 0 ? +pageSize : 25;
        const skip = (p - 1) * ps;
        const [data, total] = await Promise.all([
            this.prisma.contact.findMany({ where, skip, take: ps, orderBy: { createdAt: 'desc' } }),
            this.prisma.contact.count({ where }),
        ]);
        return { data, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
    }
    async findOne(id, organizationId) {
        const contact = await this.prisma.contact.findFirst({
            where: { id, organizationId },
            include: { leads: true, opportunities: true, activities: { orderBy: { createdAt: 'desc' }, take: 10 } },
        });
        if (!contact)
            throw new common_1.NotFoundException(`Contact ${id} not found`);
        return contact;
    }
    async create(organizationId, data) {
        return this.prisma.contact.create({ data: { ...data, organizationId } });
    }
    async update(id, organizationId, data) {
        await this.findOne(id, organizationId);
        return this.prisma.contact.update({ where: { id }, data });
    }
    async logActivity(contactId, data) {
        return this.prisma.activity.create({ data: { ...data, contactId } });
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaClient])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map