import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const AppUser = createParamDecorator((_data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.AppUser as { AppUserId: string; email: string };
});
