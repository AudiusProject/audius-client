class Hashids {
  static mockDecode = jest.fn()
  static mockEncode = jest.fn()
  decode = this.mockDecode
  encode = this.mockEncode
}

module.exports = Hashids
