import { HttpStatus, HttpMethod } from '@lattice/core';
import { HTTP_CODE_TOKEN } from './status.code.decorators';

export const COVER_TAG_TOKEN = '__corver_tag__';
export const PARAM_PATH_TOKEN = '__param_path__';

export function coverMethod(target: any, methodName: string) {
  if (hasCover(target, methodName)) return;
  Reflect.defineMetadata(COVER_TAG_TOKEN, true, target, methodName);
  const paramTypes = Reflect.getMetadata('design:paramtypes', target, methodName);
  let paramPathMeta: string[];
  let originFunc: Function = target[methodName];
  const targetFunc = async (req: any, res: any) => {
    paramPathMeta = paramPathMeta || Reflect.getMetadata(PARAM_PATH_TOKEN, target, methodName) || [];
    const ctx = { req, res }, param: any[] = [];
    paramPathMeta.forEach((path, index) => {
      const paramVal: any = path.split('.').reduce((target, item) => target ? target[item] || null : null, ctx as any);
      param[index] = translateType(paramVal, paramTypes[index]);
    });
    const result = await originFunc(...param) || '';
    if (!res.finished) {
      const httpMethod = req.method || HttpMethod.GET;
      let httpCode: Number = Reflect.getMetadata(HTTP_CODE_TOKEN, target, methodName);
      httpCode = httpCode || (httpMethod === HttpMethod.POST ? HttpStatus.CREATED : HttpStatus.OK);
      res.statusCode = httpCode;
      res.end(typeof (result) == 'string' ? result : JSON.stringify(result));
    }
  };
  targetFunc.bind = (that: Function) => {
    originFunc = originFunc.bind(that);
    return targetFunc;
  };
  target[methodName] = targetFunc;
}

function hasCover(target: any, methodName: string) {
  const hasCoverTag = Reflect.getMetadata(COVER_TAG_TOKEN, target, methodName);
  return Boolean(hasCoverTag);
}

function translateType(val: any, type: any) {
  if (val == null) return null;
  switch (type) {
    case Date:
      const timestamp = Number(val);
      return new Date(isNaN(timestamp) ? val : timestamp);
    case String:
      return String(val);
    case Number:
      return Number(val);
    default:
      return val;
  }
}