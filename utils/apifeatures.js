class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Build Query
    let queryObj = { ...this.queryString };
    let excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    //tours?duration[gte]=5&difficulty=easy&sort=asc&price[lt]=2000
    // change into :: {"duration":{"gte":"5"},"difficulty":"easy","price":{"lt":"2000"}}

    // aggregation handler
    queryObj = JSON.stringify(queryObj);
    // changing aggregation_symbol into $aggegation_symbol
    // change into :: {"duration":{"gte":"5"},"difficulty":"easy","price":{"lt":"2000"}}
    queryObj = queryObj.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryObj);

    // monggose model query
    this.query = this.query.find(queryObj);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort;
      this.query = this.query.sort(sortBy.split(',').join(' '));
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields;
      this.query = this.query.select(fields.split(',').join(' '));
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  async countDocuments() {
    return await this.query.countDocuments();
  }

  paginate() {
    let page = Number(this.queryString.page) || 1;
    let limit = Number(this.queryString.limit) || 100;
    let skip = (page - 1) * limit; //same as offset

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
