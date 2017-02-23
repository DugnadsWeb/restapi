Helpers = function(){};


Helpers.undefinedToZero = function(object){
  for (prop in object){
    if (!!object[prop])
      object[prop] = 0;
  }
  return object;
}
