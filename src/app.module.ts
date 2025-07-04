import { Module } from '@nestjs/common';
import { CategoriesModule } from './nest-modules/categories/categories.module';
import { ConfigModule } from './nest-modules/config/config.module';
import { DatabaseModule } from './nest-modules/database/database.module';
import { SharedModule } from 'nest-modules/shared/shared.module';
import { CastMembersModule } from 'nest-modules/cast-members/cast-members.module';
import { GenresModule } from 'nest-modules/genres/genres.module';
import { VideosModule } from 'nest-modules/videos/videos.module';
import { EventModule } from 'nest-modules/event/event.module';
import { UseCaseModule } from 'nest-modules/usecase/usecase.module';
import { RabbitmqModule } from 'nest-modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    SharedModule,
    EventModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    VideosModule,
    UseCaseModule,
    RabbitmqModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
