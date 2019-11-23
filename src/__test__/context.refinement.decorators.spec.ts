import * as decorator from '@transfer/decorator/context.decorators';
import { Param, Query, Body, Header, Req, Res } from '..';

describe('Context refinement decorators test', () => {
  let definePath = '';

  beforeAll(() => {
    jest.spyOn(decorator, 'RequestCtx').mockImplementation(path => {
      definePath = path;
      return () => { };
    })
  });

  afterAll(() => {
    jest.spyOn(decorator, 'RequestCtx').mockClear();
  });

  it('should call RequestCtx(path) with @Param()', () => {
    class TestController {
      testFunc(@Param() param: number) { }
    }
    expect(definePath).toBe('res.param');
  });

  it('should call RequestCtx(path) with @Param(path)', () => {
    class TestController {
      testFunc(@Param('param1') param: number) { }
    }
    expect(definePath).toBe('res.param.param1');
  });

  it('should call RequestCtx(path) with @Query()', () => {
    class TestController {
      testFunc(@Query() q: number) { }
    }
    expect(definePath).toBe('res.query');
  });

  it('should call RequestCtx(path) with @Query(path)', () => {
    class TestController {
      testFunc(@Query('query1') q: number) { }
    }
    expect(definePath).toBe('res.query.query1');
  });

  it('should call RequestCtx(path) with @Body()', () => {
    class TestController {
      testFunc(@Body() body: number) { }
    }
    expect(definePath).toBe('res.body');
  });

  it('should call RequestCtx(path) with @Body(path)', () => {
    class TestController {
      testFunc(@Body('body1') body: number) { }
    }
    expect(definePath).toBe('res.body.body1');
  });

  it('should call RequestCtx(path) with @Header()', () => {
    class TestController {
      testFunc(@Header() header: number) { }
    }
    expect(definePath).toBe('res.header');
  });

  it('should call RequestCtx(path) with @Header(path)', () => {
    class TestController {
      testFunc(@Header('header1') param: number) { }
    }
    expect(definePath).toBe('res.header.header1');
  });

  it('should call RequestCtx(path) with @Req()', () => {
    class TestController {
      testFunc(@Req() req: number) { }
    }
    expect(definePath).toBe('req');
  });

  it('should call RequestCtx(path) with @Req(path)', () => {
    class TestController {
      testFunc(@Req('param') param: number) { }
    }
    expect(definePath).toBe('req.param');
  });

  it('should call RequestCtx(path) with @Res()', () => {
    class TestController {
      testFunc(@Res() res: number) { }
    }
    expect(definePath).toBe('res');
  });

  it('should call RequestCtx(path) with @Res(path)', () => {
    class TestController {
      testFunc(@Res('param') param: number) { }
    }
    expect(definePath).toBe('res.param');
  });
});