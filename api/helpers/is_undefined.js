function is_undefined(object){
  if (typeof object === 'undefined'){
    return true;
  }
  return false;
}

module.exports = is_undefined;
