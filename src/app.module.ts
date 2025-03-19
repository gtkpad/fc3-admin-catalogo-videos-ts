import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './nest-modules/categories/categories.module';
import { ConfigModule } from './nest-modules/config/config.module';
import { DatabaseModule } from './nest-modules/database/database.module';
import { SharedModule } from 'nest-modules/shared/shared.module';
import { CastMemberModel } from 'core/cast-member/infra/repository/sequelize/cast-member-sequelize';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CategoriesModule,
    CastMemberModel,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
