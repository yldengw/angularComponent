import { AngularcomponentPage } from './app.po';

describe('angularcomponent App', () => {
  let page: AngularcomponentPage;

  beforeEach(() => {
    page = new AngularcomponentPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
