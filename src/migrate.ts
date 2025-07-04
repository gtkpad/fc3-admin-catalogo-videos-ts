import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/sequelize';
import { migrator } from './core/shared/infra/repository/sequelize/migrator';
import { MigrationsModule } from './nest-modules/migrations/migrations.module';
import { Sequelize } from 'sequelize-typescript';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationsModule, {
    logger: ['error'],
  });

  const sequelize = app.get<Sequelize>(getConnectionToken());

  migrator(sequelize).runAsCLI();
}
bootstrap();
