import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Prisma connects lazily on first query, so this service intentionally does
// NOT call $connect() on module init — that would require a live database
// at boot time, which this stage of the backend does not have yet.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
