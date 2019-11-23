import { ParamUriMatchers } from '@lattice/core';
import { UriUtils } from '@lattice/core/dist/src/utils';
import * as querystring from 'querystring';

export function jsonStr2Object(str: string): string | Object {
  try {
    return JSON.parse(str);
  } catch  {
    return str;
  }
}

export function extractParm(uri: string, matcher: ParamUriMatchers): Object {
  const param: any = {};
  let paramOffset = 0;
  const uriEnd = uri.indexOf('?');
  const uriArray = UriUtils.clean(uri.substring(0, uriEnd >= 0 ? uriEnd : uri.length)).split('/');
  matcher.uri.split('/').forEach((v, i) => {
    if (v[0] == ':') {
      param[matcher.params[paramOffset++]] = uriArray[i];
    }
  });
  return param;
}

export function extractQuery(url: string): Object {
  if (!url.includes('?')) return {};
  const queryStr = url.substring(url.indexOf('?') + 1);
  return decodeUri(queryStr);
}

export function decodeUri(uri: string) {
  return querystring.parse(uri);;
} 
