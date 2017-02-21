function DbField(data, meta){
  this.data = data;
  this.meta = !!meta ? meta : [];
}

module.exports = DbField;
