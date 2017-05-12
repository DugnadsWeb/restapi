

function qouteEscaper(req, res, next){
  objectHandler(req.body);
  next();
}


function objectHandler(object){
  switch (typeof object) {
    case "[object Array]":
        arrayIterator(object);
      break;
    case "object":
      objectIterator(object);
      break;
  }
}

function arrayIterator(array){
  for(let i=0;i<array.length;i++){
    if (typeof array[i] == 'string'){
      escapeQuote(array, i)
      break;
    }
    objectHandler(array[i]);
  }
}

function objectIterator(object){
  for(let prop in object){
    if (typeof object[prop] == 'string'){
      escapeQuote(object, prop);
      break;
    }
    objectHandler(object[prop]);
  }
}

function escapeQuote(object, prop){
  //string.replace(/(?:\\\\)+(")?|[^\\](")/, );
  object[prop] = object[prop]
    .replace(/\\*"/g, '\\"')
    .replace(/\\*'/g, "\\'");
}

module.exports = qouteEscaper;
