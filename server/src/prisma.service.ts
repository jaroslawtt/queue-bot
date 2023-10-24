import { PrismaClient } from "@prisma/client";
import { Injectable, INestApplication, OnModuleInit } from "@nestjs/common";

export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<any> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<any> {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
}
