import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { correlationIdMiddleware } from "./shared/http/correlation-id.middleware";
import { ProblemDetailsFilter } from "./shared/http/problem-details.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix("api/v1");
  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/],
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "authorization",
      "content-type",
      "idempotency-key",
      "if-match",
      "x-branch-id",
      "x-correlation-id",
      "x-tenant-id"
    ],
    exposedHeaders: ["x-correlation-id"]
  });
  app.use(correlationIdMiddleware);
  app.useGlobalFilters(new ProblemDetailsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  const openApiConfig = new DocumentBuilder()
    .setTitle("AdegaOS API")
    .setDescription("API operacional e financeira do AdegaOS SaaS.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup("api/docs", app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
