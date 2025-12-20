import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { UserModule } from './user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvMongo from '@keyv/mongo';
import { environments } from './utils/environments';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { EmailModule } from './email/email.module';
import { ProgramsModule } from './programs/programs.module';
import { UploadModule } from './upload/upload.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      stores: [
        new Keyv(
          new KeyvMongo({
            uri: environments.MONGO_URL,
            collection: 'cache',
          }),
        ),
      ],
    }),

    UserModule,
    PrismaModule,
    EmailModule,
    ProgramsModule,
    CloudinaryModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
