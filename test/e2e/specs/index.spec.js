var protractor = require('protractor');
require('protractor/jasminewd');

describe('index', function(){

  var ptor;
  var driver;

  var findByCss = function(selector){
    return driver.findElement(protractor.By.css(selector));
  };

  beforeEach(function(){
    ptor = protractor.getInstance();
    driver = ptor.driver;
    driver.get(ptor.baseUrl);
  });

  it('should load', function(){
    expect(driver.getTitle()).toContain('Musikata');
  });

  it('should render path from appConfig', function(){
    var pathEl = findByCss('.path');
    expect(pathEl.getText()).toBeDefined();
  });

});
