import 'reflect-metadata';
import { RequestCtx } from '@transfer/decorator/context.decorators';
import * as utils from '@transfer/decorator/context.utils'

describe('Context decorators test', () => {
  let covered = false;

  beforeAll(() => {
    jest.spyOn(utils, 'coverMethod').mockImplementation(() => {
      covered = true;
    });
  });

  afterAll(() => {
    jest.spyOn(utils, 'coverMethod').mockClear();
  });

  it('should define metadata and cover function with @RequestCtx(path)', () => {
    class TestController {
      testFunc(@RequestCtx('param') param: number) { }
    }
    const meta = Reflect.getMetadata(utils.PARAM_PATH_TOKEN, TestController.prototype, 'testFunc');
    expect(meta).toEqual(['param']);
  });

  it('should cover function with @RequestCtx(path)', () => {
    class TestController {
      testFunc(@RequestCtx('param') param: number) { }
    }
    expect(covered).toBe(true);
  });

});
