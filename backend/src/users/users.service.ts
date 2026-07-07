import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

// Data access only — no HTTP endpoints yet, no auth/authorization logic.
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByAuthId(authId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { authId } });
  }

  create(data: { authId: string; email: string; name?: string }): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
