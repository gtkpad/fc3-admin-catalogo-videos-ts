import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { RabbitMQMessageBroker } from 'core/shared/infra/message-broker/rabbitmq.message-broker';
import { DynamicModule } from '@nestjs/common';
import { RabbitmqConsumeErrorFilter } from './rabbitmq-consume-error/rabbitmq-consume-error.filter';

// @Global()
// @Module({
//   imports: [
//     RabbitMQModule.forRootAsync({
//       useFactory: (configService: ConfigService) => ({
//         uri: configService.get<string>('RABBITMQ_URI') ?? '',
//       }),
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [
//     {
//       provide: 'IMessageBroker',
//       useFactory: (amqpConnection: AmqpConnection) => {
//         return new RabbitMQMessageBroker(amqpConnection);
//       },
//       inject: [AmqpConnection],
//     },
//   ],
//   exports: ['IMessageBroker'],
// })
// type RabbitMQModuleOptions = {
//   enableConsumers?: boolean;
// };
type RabbitMQModuleOptions = {
  enableConsumers?: boolean;
};

export class RabbitmqModule {
  static forRoot(options: RabbitMQModuleOptions = {}): DynamicModule {
    return {
      module: RabbitmqModule,
      imports: [
        RabbitMQModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>('RABBITMQ_URI') ?? '',
            registerHandlers:
              options.enableConsumers ||
              configService.get('RABBITMQ_REGISTER_HANDLERS'),
            exchanges: [
              {
                name: 'dlx.exchange',
                type: 'topic',
              },
              {
                name: 'direct.delayed',
                type: 'x-delayed-message',
                options: {
                  arguments: {
                    'x-delayed-type': 'direct',
                  },
                },
              },
            ],
            queues: [
              {
                name: 'dlx.queue',
                exchange: 'dlx.exchange',
                routingKey: '#', //aceito qualquer routing key
                createQueueIfNotExists: false,
              },
            ],
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [RabbitmqConsumeErrorFilter],
      global: true,
      exports: [RabbitMQModule],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: 'IMessageBroker',
          useFactory: (amqpConnection: AmqpConnection) => {
            return new RabbitMQMessageBroker(amqpConnection);
          },
          inject: [AmqpConnection],
        },
      ],
      exports: ['IMessageBroker'],
    };
  }
}
