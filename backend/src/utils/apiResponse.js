export class ApiResponse {
  static success({ data = null, message = 'Success', meta = null } = {}) {
    return {
      success: true,
      message,
      data,
      meta,
    };
  }

  static error({ message = 'Error', details = null } = {}) {
    return {
      success: false,
      message,
      details,
    };
  }
}
