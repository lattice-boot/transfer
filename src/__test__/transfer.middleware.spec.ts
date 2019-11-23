import { TransferMiddleware } from '..';
import { ParamUriMatchers, HttpMethod, HttpStatus } from '@lattice/core';
import formidable from 'formidable';

describe('TransferMiddleware test', () => {
  const transfer = new TransferMiddleware();
  const resLisentFake: any = {};
  const mockLisentFunc = (env: string, cb: (data: any) => void) => {
    resLisentFake[env] = cb;
    return mockReq;
  };
  let mockRes: any = {};
  const mockReq: any = {
    url: '/test/aa/hh/bb?qr1=233&qr2=hh&qr2=pp',
    method: HttpMethod.POST,
    headers: {
      testHeader: 'any value',
      'content-type': 'text/plain'
    },
    on: mockLisentFunc,
  };
  const matcher: ParamUriMatchers = {
    uri: '/test/:param1/hh/:param2',
    type: HttpMethod.POST,
    payload: () => { },
    params: ['param1', 'param2'],
  };

  beforeAll(async () => {
    setTimeout(() => {
      resLisentFake.data(new Buffer('test'));
      resLisentFake.data(new Buffer(' str'));
      resLisentFake.end();
    }, 500);
    await transfer.check(mockReq, mockRes, matcher);
  });

  it('should be construct header context in response handle', () => {
    expect(mockRes.header.testHeader).toBe('any value');
  });

  it('should be construct param context in response handle', () => {
    expect(mockRes.param).toEqual({ param1: 'aa', param2: 'bb' });
  });

  it('should be construct query context in response handle', () => {
    expect(mockRes.query).toEqual({ qr1: '233', qr2: ['hh', 'pp'] });
  });

  it('should be construct body context in response handle', () => {
    expect(mockRes.body).toEqual('test str');
  });

  it('should be construct context with not dataable method', async () => {
    mockRes = {};
    const mockReq2: any = {
      url: '/test/aa/hh/bb',
      method: HttpMethod.GET,
      headers: {
        testHeader: 'any value',
        'content-type': 'text/plain'
      },
      on: mockLisentFunc,
    };
    matcher.type = HttpMethod.GET;
    await transfer.check(mockReq2, mockRes, matcher);
    expect(mockRes.param).toEqual({ param1: 'aa', param2: 'bb' });
  });

  it('should be construct context with out method an uri', async () => {
    mockRes = {};
    const mockReq2: any = {
      headers: {
        testHeader: 'any value',
        'content-type': 'text/plain'
      },
      on: mockLisentFunc,
    };
    matcher.type = HttpMethod.GET;
    await transfer.check(mockReq2, mockRes, matcher);
    expect(mockRes.query).toEqual({});
  });

  it('should be parse x-www-form-urlencoded body', async () => {
    mockRes = {};
    const mockReq2: any = {
      method: HttpMethod.POST,
      headers: {
        testHeader: 'any value',
        'content-type': 'application/x-www-form-urlencoded'
      },
      on: mockLisentFunc,
    };
    matcher.type = HttpMethod.POST;
    setTimeout(() => {
      resLisentFake.data(new Buffer('test=123&param=aa'));
      resLisentFake.end();
    }, 50);
    await transfer.check(mockReq2, mockRes, matcher);
    expect(mockRes.body).toEqual({
      test: '123',
      param: 'aa',
    });
  });

  it('should be parse json body', async () => {
    mockRes = {};
    const mockReq2: any = {
      method: HttpMethod.POST,
      headers: {
        testHeader: 'any value',
        'content-type': 'application/json'
      },
      on: mockLisentFunc,
    };
    matcher.type = HttpMethod.POST;
    setTimeout(() => {
      resLisentFake.data(new Buffer('{"test": 123, "param": "aa"}'));
      resLisentFake.end();
    }, 50);
    await transfer.check(mockReq2, mockRes, matcher);
    expect(mockRes.body).toEqual({
      test: 123,
      param: 'aa',
    });
  });

  it('should be parse plain body', async () => {
    mockRes = {};
    const mockReq2: any = {
      method: HttpMethod.POST,
      headers: {
        testHeader: 'any value',
        'content-type': 'text/plain'
      },
      on: mockLisentFunc,
    };
    matcher.type = HttpMethod.POST;
    setTimeout(() => {
      resLisentFake.data(new Buffer('{"test": 123, "param": "aa"}'));
      resLisentFake.end();
    }, 50);
    await transfer.check(mockReq2, mockRes, matcher);
    expect(mockRes.body).toEqual({
      test: 123,
      param: 'aa',
    });
  });

  it('should be parse form body', async () => {
    jest.mock('formidable');
    formidable.IncomingForm.prototype.parse = jest.fn().mockImplementationOnce((res, cb) => {
      cb(null, { test: 123, param: 'aa' }, []);
    });
    mockRes = {};
    const mockReq2: any = {
      method: HttpMethod.POST,
      headers: {
        testHeader: 'any value',
        'content-type': 'multipart/form-data'
      },
      on: mockLisentFunc,
    };
    matcher.type = HttpMethod.POST;
    await transfer.check(mockReq2, mockRes, matcher);
    expect(mockRes.body).toEqual({
      test: 123,
      param: 'aa',
    });
  });

  it('should be throw error when form parse faild', async () => {
    jest.mock('formidable');
    formidable.IncomingForm.prototype.parse = jest.fn().mockImplementationOnce((res, cb) => {
      cb('test faild', null, null);
    });
    mockRes = {};
    const mockReq2: any = {
      method: HttpMethod.POST,
      headers: {
        testHeader: 'any value',
        'content-type': 'multipart/form-data'
      },
      on: mockLisentFunc,
    };
    matcher.type = HttpMethod.POST;
    let exception: any;
    try {
      await transfer.check(mockReq2, mockRes, matcher);
    } catch (error) {
      exception = error;
    }
    expect(exception).toBe('test faild');
  });

  it('should end request of unsupport content-type', async () => {
    mockRes = {
      end: () => { },
    };
    const mockReq2: any = {
      method: HttpMethod.POST,
      headers: {
        testHeader: 'any value',
      },
      on: mockLisentFunc,
    };
    matcher.type = HttpMethod.POST;
    await transfer.check(mockReq2, mockRes, matcher);
    expect(mockRes.statusCode).toBe(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  });

  it('should end of response when it is no finished', async () => {
    let endTag = false;
    mockRes = {
      end: () => {
        endTag = true;
      },
    };
    matcher.type = HttpMethod.POST;
    await transfer.catch(null as any, mockRes, null as any);
    expect(endTag).toBe(true);
  });

  it('should not end of response when it is finished', async () => {
    let endTag = false;
    mockRes = {
      finished: true,
      end: () => {
        endTag = true;
      },
    };
    matcher.type = HttpMethod.POST;
    await transfer.catch(null as any, mockRes, null as any);
    expect(endTag).toBe(false);
  });
});
