import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOkResponse({
    description: "Estado basico da API.",
    schema: {
      example: {
        status: "ok",
        service: "adegaos-api",
        version: "0.1.0"
      }
    }
  })
  getHealth(): { status: "ok"; service: string; version: string } {
    return {
      status: "ok",
      service: "adegaos-api",
      version: "0.1.0"
    };
  }
}
