import { Middleware, OnFuncCheck, HttpMethod, UriMatchers, ParamUriMatchers, HttpStatus, OnException } from '@lattice/core';
import * as utils from './transfer.utils';
import formidable from 'formidable';

const dataableMethod: string[] = [HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE];

@Middleware(/.*/, 99999)
export class TransferMiddleware implements OnFuncCheck, OnException {
  check(req: import("http").IncomingMessage, res: import("http").ServerResponse, matcher: UriMatchers): Promise<void> {
    return new Promise((resolve, reject) => {
      const method = req.method || HttpMethod.GET, uri = req.url || '/', ctx = res as any;
      ctx.header = req.headers;
      ctx.param = utils.extractParm(uri, matcher as ParamUriMatchers);
      ctx.query = utils.extractQuery(uri);
      if (dataableMethod.includes(method)) {
        this.transferBody(req, res, ctx)
          .then(() => resolve())
          .catch(err => reject(err));
      } else {
        resolve();
      }
    });
  }

  catch(req: import("http").IncomingMessage, res: import("http").ServerResponse, error: any, matcher?: UriMatchers | undefined): void | Promise<void> {
    if (!res.finished) {
      res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      res.end(JSON.stringify(error));
    }
  }

  private transferBody(req: import("http").IncomingMessage, res: import("http").ServerResponse, ctx: any) {
    return new Promise((resolve, reject) => {
      const contentType = this.extractRequestType(req);
      if (!contentType) {
        res.statusCode = HttpStatus.UNSUPPORTED_MEDIA_TYPE;
        res.end();
        resolve();
        return;
      }
      if (contentType == 'form') {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
            return;
          }
          ctx.body = fields;
          ctx.files = files;
          resolve();
        });
      } else {
        const bodyChunks: any[] = [];
        req.on('data', (chunk) => {
          bodyChunks.push(chunk);
        }).on('end', () => {
          const bodyStr = Buffer.concat(bodyChunks).toString();
          ctx.body = contentType == 'json' ? utils.jsonStr2Object(bodyStr) : utils.decodeUri(bodyStr);
          resolve();
        });
      }
    });
  }

  private extractRequestType(req: import("http").IncomingMessage) {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('text/plain') || contentType.includes('json'))
      return 'json';
    if (contentType.includes('multipart/form-data'))
      return 'form';
    if (contentType.includes('x-www-form-urlencoded'))
      return 'url';
    return null;
  }
}
