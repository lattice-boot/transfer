import { RequestCtx } from './context.decorators';

export function Param(key = '') {
  key = key ? '.' + key : key;
  return RequestCtx(`res.param${key}`);
}

export function Query(key = '') {
  key = key ? '.' + key : key;
  return RequestCtx(`res.query${key}`);
}

export function Body(key = '') {
  key = key ? '.' + key : key;
  return RequestCtx(`res.body${key}`);
}

export function Header(key = '') {
  key = key ? '.' + key : key;
  return RequestCtx(`res.header${key}`);
}

export function Req(key = '') {
  key = key ? '.' + key : key;
  return RequestCtx(`req${key}`);
}

export function Res(key = '') {
  key = key ? '.' + key : key;
  return RequestCtx(`res${key}`);
}
