import { PARAM_PATH_TOKEN, coverMethod } from './context.utils';

export function RequestCtx(ctxPath: string) {
  return (target: any, methodName: string, paramIndex: number) => {
    const paramPathMeta = Reflect.getMetadata(PARAM_PATH_TOKEN, target, methodName) || [];
    paramPathMeta[paramIndex] = ctxPath;
    Reflect.defineMetadata(PARAM_PATH_TOKEN, paramPathMeta, target, methodName);
    coverMethod(target, methodName);
    return target;
  };
}
