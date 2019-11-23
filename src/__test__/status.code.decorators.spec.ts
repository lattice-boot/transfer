import 'reflect-metadata';
import { HttpCode, HTTP_CODE_TOKEN } from '../decorator';
import { HttpStatus } from '@lattice/core';

describe('HttpCode decorators test', () => {
  it('should define meta with @HttpCode(code)', () => {
    class TestClass {
      @HttpCode(HttpStatus.OK)
      func() { }
    }
    
    const targetCode = Reflect.getMetadata(HTTP_CODE_TOKEN, TestClass.prototype, 'func');
    expect(targetCode).toBe(200);
  });
});
