import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DATABASE_CONFIG } from './database.config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbConfig =
      this.config.getOrThrow<TypeOrmModuleOptions>(DATABASE_CONFIG);

    const isDev = this.config.get('NODE_ENV') === 'development';

    return {
      ...dbConfig,
      autoLoadEntities: true, //tu load cac entities
      synchronize: false,
      logging: isDev ? ['error', 'warn', 'query'] : ['error'],
      migrationsRun: false, //k tu dong chay migration
      retryAttempts: 5, //thu lai ket noi 5 lan khi that bai
      retryDelay: 3000, //khoang cach la 3s
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}
