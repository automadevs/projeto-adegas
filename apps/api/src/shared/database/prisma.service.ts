import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { createPrismaClient, PrismaClient } from "@adegaos/database";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private available = false;
  readonly client: PrismaClient = createPrismaClient();

  async onModuleInit(): Promise<void> {
    try {
      await this.client.$connect();
      await this.client.$queryRaw`SELECT 1`;
      this.available = true;
    } catch (error) {
      this.available = false;
      this.logger.warn(
        `PostgreSQL unavailable; API is running with in-memory demo data. ${error instanceof Error ? error.message : ""}`
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.available) {
      await this.client.$disconnect();
    }
  }

  isAvailable(): boolean {
    return this.available;
  }
}
