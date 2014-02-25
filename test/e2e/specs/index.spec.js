var protractor = require('protractor');
require('protractor/jasminewd');

describe('index', function(){

  it('should run', function(){
    var ptor = protractor.getInstance();
    var driver = ptor.driver;
    driver.get(ptor.baseUrl);
    var body = driver.findElement(protractor.By.css('body'));
    expect(driver.getTitle()).toContain('Musikata');
  });

});
