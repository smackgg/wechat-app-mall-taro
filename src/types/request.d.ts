declare namespace Request {
  interface requestResult {
    data: any
  }

  interface requestError {
    msg: string
    code: string
  }
}
