import 'reflect-metadata';
import { coverMethod, PARAM_PATH_TOKEN } from '@transfer/decorator/context.utils';
import { Get, HttpMethod, HttpStatus } from '@lattice/core';
import { HTTP_CODE_TOKEN } from '../decorator/status.code.decorators';

describe('Cover method test', () => {
  let oldFunc: Function;
  let newFunc: Function;
  let paramRecord: any;

  class TestClass {
    value = ''
    targetMethod(): any {
      return this.value;
    }

    @Get() // need any decorator to struct basic meta(design:paramtypes)
    targetMethod2(arg1: string, arg2: number, arg3: Date, arg4: number, arg5: any) {
      paramRecord = [arg1, arg2, arg3, arg4, arg5];
    }
  }

  it('should cover method', () => {
    oldFunc = TestClass.prototype.targetMethod;
    coverMethod(TestClass.prototype, 'targetMethod');
    newFunc = TestClass.prototype.targetMethod;
    expect(newFunc).not.toBe(oldFunc);
  });

  it('should hand (req, res) params with new func', () => {
    newFunc({}, {});
  });

  it('should match new param at function with (req, res)', async () => {
    Reflect.defineMetadata(PARAM_PATH_TOKEN, [
      'res.param.v',
      'res.param.f',
      'res.param.g',
      'res.body.n',
      'res.param.z',
    ], TestClass.prototype, 'targetMethod2')
    coverMethod(TestClass.prototype, 'targetMethod2');
    const instance = new TestClass();
    const func = instance.targetMethod2 as any;
    await func({}, {
      param: {
        v: 123,
        f: '123',
        g: '23131232',
        z: {}
      },
      end: () => { }
    });
    expect(paramRecord[0]).toBeTruthy();
    expect(paramRecord[1]).toBeTruthy();
    expect(paramRecord[2]).toBeTruthy();
    expect(paramRecord[3]).toBeNull();
    expect(paramRecord[4]).toEqual({});
  });

  it('should translate new params type', () => {
    expect(typeof (paramRecord[0]) == 'string').toBeTruthy();
    expect(typeof (paramRecord[1]) == 'number').toBeTruthy();
    expect(paramRecord[2]).toBeInstanceOf(Date);
  });

  it('should bind oldFunc this context with newFunc bind', async () => {
    const instance = new TestClass();
    const func = instance.targetMethod as any;
    let result: string = '';
    await func.bind({ value: '233' })({}, { end: (r: string) => { result = r } });
    expect(result).toBe('233');
  });

  it('should not repeat cover methods', () => {
    oldFunc = TestClass.prototype.targetMethod;
    coverMethod(TestClass.prototype, 'targetMethod');
    newFunc = TestClass.prototype.targetMethod;
    expect(newFunc).toBe(oldFunc);
  });

  it('should finished as biz func and skip end', async () => {
    const instance = new TestClass();
    const func = instance.targetMethod as any;
    let tagStr = '';
    await func({}, { end: (r: string) => { tagStr = 'tags' }, finished: true });
    expect(tagStr).not.toBe('tags');
  });

  it('should return 201 with post request', async () => {
    const instance = new TestClass();
    const func = instance.targetMethod as any;
    const res: any = { end: (r: string) => { } };
    await func({ method: HttpMethod.POST }, res);
    expect(res.statusCode).toBe(201);
  });

  it('should return customize code with HTTP_CODE_TOKEN reflect', async () => {
    Reflect.defineMetadata(HTTP_CODE_TOKEN, HttpStatus.NOT_FOUND, TestClass.prototype, 'targetMethod');
    const instance = new TestClass();
    const func = instance.targetMethod as any;
    const res: any = { end: (r: string) => { } };
    await func({}, res);
    expect(res.statusCode).toBe(404);
  });

  it('should end of json string with object result', async () => {
    class TestClass {
      targetMethod(): any {
        return { test: 'hhh' };
      }
    }
    coverMethod(TestClass.prototype, 'targetMethod');
    const instance = new TestClass();
    let result: string = '';
    let func = instance.targetMethod as any;
    func = func.bind({ value: { test: 'hhh' } });
    await func({}, { end: (r: string) => { result = r } });
    expect(result).toBe(JSON.stringify({ test: 'hhh' }));
  });
});
