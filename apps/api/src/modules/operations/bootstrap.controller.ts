import { Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { OperationsService } from "./operations.service";

@ApiTags("bootstrap")
@Controller("bootstrap")
export class BootstrapController {
  constructor(private readonly operations: OperationsService) {}

  @Get("demo")
  status() {
    return this.operations.bootstrapDemoData();
  }

  @Post("demo")
  bootstrap() {
    return this.operations.bootstrapDemoData();
  }
}
