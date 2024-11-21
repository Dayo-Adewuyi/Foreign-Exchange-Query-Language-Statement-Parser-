import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as request from 'supertest';
import { ValidationPipe } from '@nestjs/common';
import { FxqlModule } from '../src/modules/fxql/fxql.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FxRateEntity } from '../src/core/domain/entities/fx-rate.entity';
import { DataSource } from 'typeorm';
import configuration from '../src/config/configuration';

describe('FxqlController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  process.env.NODE_ENV = 'test';

  const testConfig = {
    database: {
      type: 'postgres' as const,
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'fxql_db',
      entities: [FxRateEntity],
      synchronize: true,
      logging: false,
      ssl:
        process.env.DB_SSL_ENABLED === 'true'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (
            configService: ConfigService,
          ): Promise<TypeOrmModuleOptions> => ({
            ...testConfig.database,
            // Override with environment variables if provided
            host: process.env.TEST_DB_HOST || testConfig.database.host,
            port:
              parseInt(process.env.TEST_DB_PORT) || testConfig.database.port,
            username:
              process.env.TEST_DB_USERNAME || testConfig.database.username,
            password:
              process.env.TEST_DB_PASSWORD || testConfig.database.password,
            database: process.env.TEST_DB_NAME || testConfig.database.database,
          }),
          inject: [ConfigService],
        }),
        FxqlModule,
      ],
    }).compile();

    // Create the app
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();

    // Get the DataSource
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Verify database connection
    try {
      await dataSource.query('SELECT 1');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      // Clean the database before each test
      await dataSource.createQueryRunner().clearTable('fx_rates');
    } catch (error) {
      console.error('Failed to clear table:', error);
      throw error;
    }
  });

  afterEach(async () => {
    // Additional cleanup if needed
    await dataSource.createQueryRunner().clearTable('fx_rates');
  });

  afterAll(async () => {
    try {
      // Clean up database and close connections
      if (dataSource && dataSource.isInitialized) {
        await dataSource.dropDatabase();
        await dataSource.destroy();
      }
      if (app) {
        await app.close();
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  });
  describe('/fxql-statements (POST)', () => {
    it('should create new fx rates', async () => {
      const fxql = `
          USD-EUR {
            BUY 0.85
            SELL 0.90
            CAP 10000
          }
          
          GBP-JPY {
            BUY 180.50
            SELL 185.00
            CAP 20000
          }
        `;

      const response = await request(app.getHttpServer())
        .post('/fxql-statements')
        .send({ FXQL: fxql })
        .expect(201);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            SourceCurrency: 'USD',
            DestinationCurrency: 'EUR',
            BuyPrice: 0.85,
            SellPrice: 0.9,
            CapAmount: 10000,
          }),
          expect.objectContaining({
            SourceCurrency: 'GBP',
            DestinationCurrency: 'JPY',
            BuyPrice: 180.5,
            SellPrice: 185.0,
            CapAmount: 20000,
          }),
        ]),
      );

      // Verify database state
      const rates = await dataSource.getRepository(FxRateEntity).find();

      expect(rates).toHaveLength(2);
    });

    it('should update existing fx rates', async () => {
      // First create an initial rate
      const initialFxql = `
          USD-EUR {
            BUY 0.85
            SELL 0.90
            CAP 10000
          }
        `;

      await request(app.getHttpServer())
        .post('/fxql-statements')
        .send({ FXQL: initialFxql })
        .expect(201);

      // Now update it
      const updateFxql = `
          USD-EUR {
            BUY 0.87
            SELL 0.92
            CAP 12000
          }
        `;

      const response = await request(app.getHttpServer())
        .post('/fxql-statements')
        .send({ FXQL: updateFxql })
        .expect(201);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        SourceCurrency: 'USD',
        DestinationCurrency: 'EUR',
        BuyPrice: 0.87,
        SellPrice: 0.92,
        CapAmount: 12000,
      });

      // Verify only one record exists
      const rates = await dataSource.getRepository(FxRateEntity).find();

      expect(rates).toHaveLength(1);
      expect(rates[0]).toMatchObject({
        buyPrice: 0.87,
        sellPrice: 0.92,
        capAmount: 12000,
      });
    });

    it('should handle validation errors', async () => {
      // Missing FXQL field
      await request(app.getHttpServer())
        .post('/fxql-statements')
        .send({})
        .expect(400);

      // Empty FXQL string
      await request(app.getHttpServer())
        .post('/fxql-statements')
        .send({ FXQL: '' })
        .expect(400);

      // Invalid currency
      await request(app.getHttpServer())
        .post('/fxql-statements')
        .send({
          FXQL: `
              USD-XXX {
                BUY 0.85
                SELL 0.90
                CAP 10000
              }
            `,
        })
        .expect(400);
    });

    it('should handle rate limiting', async () => {
      const fxql = `
          USD-EUR {
            BUY 0.85
            SELL 0.90
            CAP 10000
          }
        `;

      // Make multiple rapid requests
      const requests = Array(11)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .post('/fxql-statements')
            .send({ FXQL: fxql }),
        );

      const results = await Promise.all(requests);

      // At least one request should be rate limited
      expect(results.some((result) => result.status === 429)).toBeTruthy();
    });

    it('should handle syntax errors', async () => {
      const invalidFxql = `
          USD-EUR {
            BUY 0.85
            SELL
            CAP 10000
          }
        `;

      const response = await request(app.getHttpServer())
        .post('/fxql-statements')
        .send({ FXQL: invalidFxql })
        .expect(400);

      expect(response.body.message).toMatch(/Invalid syntax/i);
    });

    it('should handle maximum length restriction', async () => {
      // Generate a very long FXQL string
      const template = `
          USD-EUR {
            BUY 0.85
            SELL 0.90
            CAP 10000
          }
        `;
      const longFxql = Array(1000).fill(template).join('\n');

      const response = await request(app.getHttpServer())
        .post('/fxql-statements')
        .send({ FXQL: longFxql })
        .expect(400);

      expect(response.body.message).toMatch(/length/i);
    });

    it('should preserve precision of decimal numbers', async () => {
      const fxql = `
          USD-EUR {
            BUY 0.85123
            SELL 0.90456
            CAP 10000
          }
        `;

      const response = await request(app.getHttpServer())
        .post('/fxql-statements')
        .send({ FXQL: fxql })
        .expect(201);

      expect(response.body[0].BuyPrice).toBe(0.85123);
      expect(response.body[0].SellPrice).toBe(0.90456);
    });

    it('should handle multiple currency pairs with same source currency', async () => {
      const fxql = `
          USD-EUR {
            BUY 0.85
            SELL 0.90
            CAP 10000
          }

          USD-GBP {
            BUY 0.75
            SELL 0.80
            CAP 15000
          }
        `;

      const response = await request(app.getHttpServer())
        .post('/fxql-statements')
        .send({ FXQL: fxql })
        .expect(201);

      expect(response.body).toHaveLength(2);
      expect(
        response.body.filter((rate) => rate.SourceCurrency === 'USD'),
      ).toHaveLength(2);
    });
  });
});
