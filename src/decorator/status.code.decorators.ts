import { HttpStatus as HttpStatusEnum } from '@lattice/core';

export const HTTP_CODE_TOKEN = '__http_code__';

export function HttpCode(code: HttpStatusEnum) {
  return (target: any, methodName: string) => {
    Reflect.defineMetadata(HTTP_CODE_TOKEN, code, target, methodName);
    return target;
  };
}
